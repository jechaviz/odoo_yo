"""Reusable contracts/helpers for catalog-driven phase execution."""

from dataclasses import dataclass
from typing import Any, Dict, Literal

from lib.python.odoo_reusable.core.exceptions import RPRentalError

FailurePolicy = Literal["continue", "stop"]


@dataclass(frozen=True)
class PhaseSpec:
    """Declarative description of one execution phase."""

    step_number: int
    title: str
    result_key: str
    runner_name: str
    skip_flag_name: str | None = None
    forwarded_args: tuple[str, ...] = ()
    failure_policy: FailurePolicy = "stop"


def should_run_phase(phase: PhaseSpec, phase_context: Dict[str, Any]) -> bool:
    """Return whether a phase should execute under the current skip flags."""
    if phase.skip_flag_name is None:
        return True
    return not bool(phase_context.get(phase.skip_flag_name, False))


def build_phase_runner_kwargs(
    phase: PhaseSpec,
    phase_context: Dict[str, Any],
) -> Dict[str, Any]:
    """Forward only explicitly declared context arguments to a phase runner."""
    return {arg_name: phase_context[arg_name] for arg_name in phase.forwarded_args}


def build_phase_status_payload(
    phase: PhaseSpec,
    status: str,
    message: str | None = None,
) -> Dict[str, Any]:
    """Build normalized phase status payload for results['phase_statuses']."""
    payload: Dict[str, Any] = {
        "step_number": phase.step_number,
        "title": phase.title,
        "status": status,
        "failure_policy": phase.failure_policy,
    }
    if message:
        payload["message"] = message
    return payload


def serialize_phase_error_payload(
    phase: PhaseSpec,
    exc: Exception,
) -> Dict[str, Any]:
    """Convert a phase exception into a structured payload for result aggregation."""
    if isinstance(exc, RPRentalError):
        error_payload = exc.to_dict()
    else:
        error_payload = {
            "error_type": type(exc).__name__,
            "message": str(exc),
            "details": {},
        }

    return {
        "phase": phase.result_key,
        "step_number": phase.step_number,
        "title": phase.title,
        "failure_policy": phase.failure_policy,
        **error_payload,
    }
