<template>
  <section class="app-ops-files ui-card">
    <header class="app-ops-panel-header">
      <h4>{{ titleText }}</h4>
      <p>{{ subtitleText }}</p>
    </header>

    <div class="app-ops-files__body">
      <aside class="app-ops-files__explorer">
        <div class="app-ops-files__toolbar">
          <Button variant="secondary" size="sm" :label="uploadLabel" @click="triggerUpload" />
          <Button variant="ghost" size="sm" :label="newLabel" @click="createDraftFile" />
          <input ref="uploader" type="file" class="app-ops-files__uploader" @change="onUpload" />
        </div>

        <div class="app-ops-files__tree">
          <section v-for="group in groupedFiles" :key="group.path" class="app-ops-files__group">
            <button type="button" class="app-ops-files__group-header" @click="toggleGroup(group.path)">
              <i :class="expanded[group.path] ? 'fa-solid fa-folder-open' : 'fa-solid fa-folder'" />
              <span>{{ group.pathLabel }}</span>
              <i class="fa-solid fa-chevron-down app-ops-files__group-arrow" :class="{ 'is-open': expanded[group.path] }" />
            </button>

            <div v-if="expanded[group.path]" class="app-ops-files__group-files">
              <button
                v-for="file in group.files"
                :key="file.id"
                type="button"
                class="app-ops-files__file-row"
                :class="{ 'is-active': file.id === selectedId }"
                @click="selectFile(file.id)"
              >
                <i :class="fileIcon(file.name)" />
                <span>{{ file.name }}</span>
              </button>
            </div>
          </section>
        </div>
      </aside>

      <section class="app-ops-files__preview ui-card">
        <template v-if="selectedFile">
          <header class="app-ops-files__preview-header">
            <div>
              <p class="app-ops-files__preview-title">{{ selectedFile.name }}</p>
              <p class="app-ops-files__preview-meta">{{ selectedFile.path || '/' }} · {{ selectedFile.updatedAt }}</p>
            </div>
            <div class="app-ops-files__preview-actions">
              <Button variant="ghost" size="sm" :label="renameLabel" @click="startRename" />
              <Button variant="ghost" size="sm" :label="saveLabel" @click="saveFile" />
            </div>
          </header>

          <div v-if="renaming" class="app-ops-files__rename-row">
            <Input v-model="renameValue" :label="renameInputLabel" />
            <Button variant="primary" size="sm" :label="renameApplyLabel" @click="applyRename" />
          </div>

          <Textarea
            v-model="draftContent"
            :label="editorLabel"
            :rows="12"
            :placeholder="editorPlaceholder"
          />
        </template>

        <p v-else class="app-ops-files__empty">{{ emptyText }}</p>
      </section>
    </div>
  </section>
</template>

<script>
import Button from 'app/primitives/Button.vue';
import Input from 'app/primitives/Input.vue';
import Textarea from 'app/primitives/Textarea.vue';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value || []));
}

function normalizePath(path = '/') {
  const clean = String(path || '/').trim();
  if (!clean || clean === '.') return '/';
  return clean.endsWith('/') ? clean : `${clean}/`;
}

export default {
  name: 'FilesPanel',
  components: {
    Button,
    Input,
    Textarea,
  },
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Array, default: () => [] },
    uiText: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      files: deepClone(this.modelValue),
      selectedId: null,
      expanded: {},
      renaming: false,
      renameValue: '',
      draftContent: '',
      isSyncingFromProp: false,
    };
  },
  computed: {
    titleText() {
      return this.uiText.shellOpsFilesTitle || 'File explorer';
    },
    subtitleText() {
      return this.uiText.shellOpsFilesSubtitle || 'Organize and edit record artifacts in-context.';
    },
    uploadLabel() {
      return this.uiText.shellOpsFilesUpload || 'Upload';
    },
    newLabel() {
      return this.uiText.shellOpsFilesNew || 'New file';
    },
    renameLabel() {
      return this.uiText.shellOpsFilesRename || 'Rename';
    },
    saveLabel() {
      return this.uiText.shellOpsFilesSave || 'Save';
    },
    renameInputLabel() {
      return this.uiText.shellOpsFilesRenameInput || 'New file name';
    },
    renameApplyLabel() {
      return this.uiText.shellOpsFilesRenameApply || 'Apply';
    },
    editorLabel() {
      return this.uiText.shellOpsFilesEditorLabel || 'File content';
    },
    editorPlaceholder() {
      return this.uiText.shellOpsFilesEditorPlaceholder || 'Write markdown, notes, or structured text...';
    },
    emptyText() {
      return this.uiText.shellOpsFilesEmpty || 'Select a file from the explorer.';
    },
    groupedFiles() {
      const grouped = this.files.reduce((acc, file) => {
        const key = normalizePath(file.path || '/');
        if (!acc[key]) acc[key] = [];
        acc[key].push(file);
        return acc;
      }, {});
      return Object.entries(grouped)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([path, files]) => ({
          path,
          pathLabel: path === '/' ? 'root/' : path,
          files: files.slice().sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''))),
        }));
    },
    selectedFile() {
      return this.files.find((item) => item.id === this.selectedId) || null;
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler(nextValue) {
        this.isSyncingFromProp = true;
        this.files = deepClone(nextValue);
        this.ensureSelected();
        this.$nextTick(() => {
          this.isSyncingFromProp = false;
        });
      },
    },
    files: {
      deep: true,
      handler(nextValue) {
        if (this.isSyncingFromProp) return;
        const incoming = JSON.stringify(nextValue || []);
        const current = JSON.stringify(this.modelValue || []);
        if (incoming === current) return;
        this.$emit('update:modelValue', deepClone(nextValue));
      },
    },
    selectedFile: {
      immediate: true,
      handler(nextFile) {
        this.draftContent = String(nextFile?.content || '');
        this.renameValue = String(nextFile?.name || '');
      },
    },
  },
  mounted() {
    this.bootstrapExplorer();
  },
  methods: {
    bootstrapExplorer() {
      const baseExpanded = {};
      this.groupedFiles.forEach((group, index) => {
        baseExpanded[group.path] = index < 2;
      });
      this.expanded = baseExpanded;
      this.ensureSelected();
    },
    ensureSelected() {
      if (this.selectedId && this.files.some((item) => item.id === this.selectedId)) return;
      this.selectedId = this.files[0]?.id || null;
    },
    toggleGroup(path) {
      this.expanded = {
        ...this.expanded,
        [path]: !this.expanded[path],
      };
    },
    selectFile(fileId) {
      this.selectedId = fileId;
      this.renaming = false;
    },
    fileIcon(name = '') {
      const lower = String(name).toLowerCase();
      if (lower.endsWith('.md')) return 'fa-brands fa-markdown';
      if (lower.endsWith('.json')) return 'fa-solid fa-brackets-curly';
      if (lower.endsWith('.pdf')) return 'fa-regular fa-file-pdf';
      if (lower.endsWith('.xlsx') || lower.endsWith('.csv')) return 'fa-regular fa-file-excel';
      return 'fa-regular fa-file-lines';
    },
    triggerUpload() {
      this.$refs.uploader?.click();
    },
    createDraftFile() {
      const fileId = `file-${Date.now()}`;
      const newFile = {
        id: fileId,
        name: `draft-${new Date().toISOString().slice(0, 10)}.md`,
        path: '/workspace/',
        content: '# New file\n',
        owner: 'Workspace User',
        size: 0,
        updatedAt: new Date().toISOString(),
      };
      this.files = [newFile, ...this.files];
      this.expanded = { ...this.expanded, '/workspace/': true };
      this.selectFile(fileId);
    },
    onUpload(event) {
      const file = event.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = typeof reader.result === 'string' ? reader.result : '';
        const uploaded = {
          id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          path: '/uploads/',
          content,
          owner: 'Workspace User',
          size: Number(file.size || 0),
          updatedAt: new Date().toISOString(),
        };
        this.files = [uploaded, ...this.files];
        this.expanded = { ...this.expanded, '/uploads/': true };
        this.selectFile(uploaded.id);
        event.target.value = '';
      };
      reader.readAsText(file);
    },
    startRename() {
      if (!this.selectedFile) return;
      this.renaming = true;
      this.renameValue = this.selectedFile.name;
    },
    applyRename() {
      if (!this.selectedFile) return;
      const nextName = String(this.renameValue || '').trim();
      if (!nextName) return;
      this.files = this.files.map((file) => (
        file.id === this.selectedFile.id
          ? { ...file, name: nextName, updatedAt: new Date().toISOString() }
          : file
      ));
      this.renaming = false;
    },
    saveFile() {
      if (!this.selectedFile) return;
      this.files = this.files.map((file) => (
        file.id === this.selectedFile.id
          ? { ...file, content: this.draftContent, updatedAt: new Date().toISOString() }
          : file
      ));
    },
  },
};
</script>

