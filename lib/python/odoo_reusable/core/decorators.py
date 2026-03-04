"""
Decorators Module - AOP Cross-cutting Concerns
==============================================
Implements decorators for logging, retries, validation, and performance.
"""

import functools
import logging
import time
from typing import Any, Callable, Optional, ParamSpec, TypeVar

from lib.python.odoo_reusable.core.exceptions import RPRentalError, ValidationError

logger = logging.getLogger(__name__)

P = ParamSpec("P")
T = TypeVar("T")


def log_operation(
    operation_name: Optional[str] = None,
    log_args: bool = True,
    log_result: bool = False,
    log_time: bool = True,
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator to log operation execution."""

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            name = operation_name or func.__name__
            log_data = {"operation": name}
            if log_args:
                log_data["args"] = str(args)[:200]
                log_data["kwargs"] = str(kwargs)[:200]

            logger.info("Starting operation: %s", name)
            if log_args:
                logger.debug("Arguments: %s", log_data)

            start_time = time.time()

            try:
                result = func(*args, **kwargs)
                elapsed = time.time() - start_time
                if log_time:
                    logger.info("Completed %s in %.3fs", name, elapsed)
                else:
                    logger.info("Completed %s", name)
                if log_result:
                    logger.debug("Result: %s", str(result)[:500])
                return result
            except RPRentalError as exc:
                elapsed = time.time() - start_time
                logger.error(
                    "Operation %s failed after %.3fs: %s",
                    name,
                    elapsed,
                    exc.message,
                    extra={"error_details": exc.details},
                )
                raise
            except Exception:
                elapsed = time.time() - start_time
                logger.exception(
                    "Operation %s failed with unexpected error after %.3fs",
                    name,
                    elapsed,
                )
                raise

        return wrapper

    return decorator


def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,),
    on_retry: Optional[Callable[[Exception, int], None]] = None,
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator to retry operations on failure."""

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            current_delay = delay
            last_exception = None

            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:  # type: ignore[misc]
                    last_exception = exc
                    if attempt < max_attempts:
                        logger.warning(
                            "Attempt %s/%s failed for %s: %s. Retrying in %.1fs...",
                            attempt,
                            max_attempts,
                            func.__name__,
                            exc,
                            current_delay,
                        )
                        if on_retry:
                            on_retry(exc, attempt)
                        time.sleep(current_delay)
                        current_delay *= backoff
                    else:
                        logger.error("All %s attempts failed for %s", max_attempts, func.__name__)

            raise last_exception

        return wrapper

    return decorator


def validate_input(
    *validators: Callable[[Any], bool],
    error_message: str = "Input validation failed",
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator to validate function inputs."""

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            all_args = list(args) + list(kwargs.values())
            for index, (arg, validator) in enumerate(zip(all_args, validators)):
                if not validator(arg):
                    raise ValidationError(
                        f"{error_message} (argument {index})",
                        field=f"arg_{index}",
                        value=arg,
                    )
            return func(*args, **kwargs)

        return wrapper

    return decorator


def cache_result(
    ttl_seconds: Optional[float] = None,
    key_func: Optional[Callable[..., str]] = None,
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator to cache function results."""
    cache: dict = {}

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            key = key_func(*args, **kwargs) if key_func else str((args, tuple(sorted(kwargs.items()))))
            if key in cache:
                cached_result, cached_time = cache[key]
                if ttl_seconds is None or time.time() - cached_time < ttl_seconds:
                    logger.debug("Cache hit for %s", func.__name__)
                    return cached_result

            result = func(*args, **kwargs)
            cache[key] = (result, time.time())
            logger.debug("Cached result for %s", func.__name__)
            return result

        return wrapper

    return decorator


def measure_performance(
    threshold_ms: Optional[float] = None,
    alert_callback: Optional[Callable[[str, float], None]] = None,
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator to measure and optionally alert on performance."""

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            start_time = time.perf_counter()
            result = func(*args, **kwargs)
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            logger.debug("%s took %.2fms", func.__name__, elapsed_ms)
            if threshold_ms and elapsed_ms > threshold_ms:
                logger.warning(
                    "%s exceeded threshold: %.2fms > %sms",
                    func.__name__,
                    elapsed_ms,
                    threshold_ms,
                )
                if alert_callback:
                    alert_callback(func.__name__, elapsed_ms)
            return result

        return wrapper

    return decorator


def handle_errors(
    default: Optional[T] = None,
    reraise: bool = False,
    error_handler: Optional[Callable[[Exception], None]] = None,
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator to handle errors gracefully."""

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            try:
                return func(*args, **kwargs)
            except Exception as exc:
                logger.error("Error in %s: %s", func.__name__, exc)
                if error_handler:
                    error_handler(exc)
                if reraise:
                    raise
                return default

        return wrapper

    return decorator

