<template>
  <section class="app-ops-comments ui-card">
    <header class="app-ops-panel-header">
      <h4>{{ titleText }}</h4>
      <p>{{ subtitleText }}</p>
    </header>

    <div class="app-ops-comments__composer">
      <Textarea
        v-model="newComment"
        :label="composerLabel"
        :rows="3"
        :placeholder="composerPlaceholder"
      />
      <div class="app-ops-comments__composer-actions">
        <Button variant="primary" size="sm" :label="postLabel" @click="postComment()" />
      </div>
    </div>

    <div v-if="threadRoots.length" class="app-ops-comments__thread">
      <article v-for="item in threadRoots" :key="item.id" class="app-ops-comment-row">
        <div class="app-ops-comment-row__avatar">{{ initials(resolveUser(item.userId).name) }}</div>

        <div class="app-ops-comment-row__body">
          <header class="app-ops-comment-row__meta">
            <strong>{{ resolveUser(item.userId).name }}</strong>
            <span>{{ formatTime(item.createdAt) }}</span>
          </header>
          <p>{{ item.text }}</p>

          <footer class="app-ops-comment-row__actions">
            <button type="button" @click="toggleReply(item.id)">{{ replyLabel }}</button>
          </footer>

          <div v-if="replyOpen[item.id]" class="app-ops-comment-row__reply-box">
            <Textarea
              v-model="replyDraft[item.id]"
              :rows="2"
              :placeholder="replyPlaceholder"
            />
            <div class="app-ops-comments__composer-actions">
              <Button variant="secondary" size="sm" :label="cancelLabel" @click="closeReply(item.id)" />
              <Button variant="primary" size="sm" :label="replySendLabel" @click="postComment(item.id)" />
            </div>
          </div>

          <div v-if="repliesByParent[item.id]?.length" class="app-ops-comment-row__replies">
            <article v-for="reply in repliesByParent[item.id]" :key="reply.id" class="app-ops-comment-row is-reply">
              <div class="app-ops-comment-row__avatar">{{ initials(resolveUser(reply.userId).name) }}</div>
              <div class="app-ops-comment-row__body">
                <header class="app-ops-comment-row__meta">
                  <strong>{{ resolveUser(reply.userId).name }}</strong>
                  <span>{{ formatTime(reply.createdAt) }}</span>
                </header>
                <p>{{ reply.text }}</p>
              </div>
            </article>
          </div>
        </div>
      </article>
    </div>

    <p v-else class="app-ops-comments__empty">{{ emptyText }}</p>
  </section>
</template>

<script>
import Button from 'app/primitives/Button.vue';
import Textarea from 'app/primitives/Textarea.vue';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value || []));
}

export default {
  name: 'CommentsPanel',
  components: {
    Button,
    Textarea,
  },
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Array, default: () => [] },
    users: { type: Array, default: () => [] },
    uiText: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      comments: deepClone(this.modelValue),
      newComment: '',
      replyOpen: {},
      replyDraft: {},
      currentUserId: 'workspace-user',
      isSyncingFromProp: false,
    };
  },
  computed: {
    titleText() {
      return this.uiText.shellOpsCommentsTitle || 'Threaded comments';
    },
    subtitleText() {
      return this.uiText.shellOpsCommentsSubtitle || 'Capture rationale and handoff context directly on the focused record.';
    },
    composerLabel() {
      return this.uiText.shellOpsCommentsComposerLabel || 'New comment';
    },
    composerPlaceholder() {
      return this.uiText.shellOpsCommentsComposerPlaceholder || 'Write a precise update for the next owner...';
    },
    postLabel() {
      return this.uiText.shellOpsCommentsPost || 'Post comment';
    },
    replyLabel() {
      return this.uiText.shellOpsCommentsReply || 'Reply';
    },
    replySendLabel() {
      return this.uiText.shellOpsCommentsReplySend || 'Send reply';
    },
    replyPlaceholder() {
      return this.uiText.shellOpsCommentsReplyPlaceholder || 'Add a reply...';
    },
    cancelLabel() {
      return this.uiText.cancelText || 'Cancel';
    },
    emptyText() {
      return this.uiText.shellOpsCommentsEmpty || 'No comments yet.';
    },
    threadRoots() {
      return this.comments
        .filter((item) => !item.parentId)
        .slice()
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    },
    repliesByParent() {
      return this.comments.reduce((acc, item) => {
        if (!item.parentId) return acc;
        if (!acc[item.parentId]) acc[item.parentId] = [];
        acc[item.parentId].push(item);
        return acc;
      }, {});
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler(nextValue) {
        this.isSyncingFromProp = true;
        this.comments = deepClone(nextValue);
        this.$nextTick(() => {
          this.isSyncingFromProp = false;
        });
      },
    },
    comments: {
      deep: true,
      handler(nextValue) {
        if (this.isSyncingFromProp) return;
        const incoming = JSON.stringify(nextValue || []);
        const current = JSON.stringify(this.modelValue || []);
        if (incoming === current) return;
        this.$emit('update:modelValue', deepClone(nextValue));
      },
    },
  },
  methods: {
    resolveUser(userId) {
      return this.users.find((item) => item.id === userId) || { id: userId, name: 'Workspace User' };
    },
    initials(name) {
      return String(name || 'U')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';
    },
    formatTime(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return date.toLocaleString();
    },
    nextId(prefix = 'comment') {
      return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    },
    postComment(parentId = null) {
      const text = parentId ? String(this.replyDraft[parentId] || '').trim() : String(this.newComment || '').trim();
      if (!text) return;
      const next = {
        id: this.nextId(parentId ? 'reply' : 'comment'),
        parentId: parentId || null,
        userId: this.currentUserId,
        text,
        createdAt: new Date().toISOString(),
      };
      this.comments = [next, ...this.comments];
      if (parentId) {
        this.replyDraft = { ...this.replyDraft, [parentId]: '' };
        this.replyOpen = { ...this.replyOpen, [parentId]: false };
      } else {
        this.newComment = '';
      }
    },
    toggleReply(commentId) {
      this.replyOpen = {
        ...this.replyOpen,
        [commentId]: !this.replyOpen[commentId],
      };
    },
    closeReply(commentId) {
      this.replyOpen = { ...this.replyOpen, [commentId]: false };
      this.replyDraft = { ...this.replyDraft, [commentId]: '' };
    },
  },
};
</script>
