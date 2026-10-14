/* Supabase creator login, private model storage, and published catalogue feed. */
(function () {
  'use strict';

  const config = window.SUPABASE_CONFIG || {};
  const overlay = document.getElementById('upload-overlay');
  const status = document.getElementById('upload-setup-status');
  const loginForm = document.getElementById('creator-login-form');
  const uploadContent = document.getElementById('creator-upload-content');
  const uploadForm = document.getElementById('creator-upload-form');
  const loginButton = document.getElementById('creator-login-btn');
  const submitButton = document.getElementById('model-submit-btn');
  const progress = document.getElementById('upload-progress');
  const modelList = document.getElementById('creator-model-list');
  const modelBucket = 'jewellery-model-files';
  const previewBucket = 'jewellery-previews';
  const maxModelBytes = 50 * 1024 * 1024;
  const maxPreviewBytes = 5 * 1024 * 1024;
  const allowedExtensions = new Set(['blend', 'fbx', 'obj', 'stl', 'glb', 'gltf', '3mf', 'step', 'stp', 'iges', 'igs']);
  const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const categoryTypes = {
    rings: 'ring',
    necklaces: 'necklace',
    earrings: 'earrings',
    pendants: 'pendant',
    bracelets: 'bracelet',
  };
  const categoryColors = {
    rings: '#f0b90b',
    necklaces: '#d9a441',
    earrings: '#d6a4ff',
    pendants: '#38bdf8',
    bracelets: '#fb7185',
  };

  let client = null;
  let currentUser = null;
  let authSubscription = null;

  function setStatus(message, kind) {
    if (!message) {
      status.textContent = '';
      status.classList.add('hidden');
      return;
    }
    status.textContent = message;
    status.dataset.kind = kind || 'info';
    status.classList.remove('hidden');
  }

  function setProgress(message) {
    progress.textContent = message;
    progress.classList.remove('hidden');
  }

  function clearProgress() {
    progress.textContent = '';
    progress.classList.add('hidden');
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[char]);
  }

  function formatBytes(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function showSignedIn(user) {
    currentUser = user;
    loginForm.classList.add('hidden');
    uploadContent.classList.remove('hidden');
    document.getElementById('creator-account-email').textContent = user.email || 'Creator account';
    setStatus('Signed in. Your model files are private until you publish the listing.', 'success');
    refreshOwnerUploads();
  }

  function showSignedOut() {
    currentUser = null;
    loginForm.classList.remove('hidden');
    uploadContent.classList.add('hidden');
    modelList.textContent = '';
  }

  async function loadPublicModels() {
    let data;
    try {
      const result = await client
        .from('jewellery_models')
        .select('id,title,description,category,price,model_filename,model_size_bytes,preview_path,created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (result.error) throw result.error;
      data = result.data || [];
    } catch (error) {
      console.error('Unable to load published jewellery models:', error.message);
      document.dispatchEvent(new CustomEvent('community-products-error', { detail: { message: error.message } }));
      return;
    }

    const products = data.map(row => {
      const extension = row.model_filename.split('.').pop().toLowerCase();
      const preview = client.storage.from(previewBucket).getPublicUrl(row.preview_path);
      const description = row.description || '';
      return {
        id: `community-${row.id}`,
        name: row.title,
        description,
        category: 'jewellery',
        subcategory: row.category.charAt(0).toUpperCase() + row.category.slice(1),
        creator: 'Community Creator',
        price: Number(row.price),
        originalPrice: null,
        rating: 0,
        reviews: 0,
        downloads: 0,
        featured: false,
        new: true,
        formats: [`.${extension.toUpperCase()}`],
        fileSize: formatBytes(Number(row.model_size_bytes)),
        polygons: '3D model',
        textures: 'See preview',
        licensed: 'Creator listed',
        svgType: categoryTypes[row.category] || 'ring',
        accentColor: categoryColors[row.category] || '#d9a441',
        image: preview.data.publicUrl,
        tags: description.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 20),
      };
    });

    document.dispatchEvent(new CustomEvent('community-products-loaded', { detail: { products } }));
  }

  async function refreshOwnerUploads() {
    if (!currentUser) return;
    modelList.textContent = 'Loading your uploads…';

    let data;
    try {
      const result = await client
        .from('jewellery_models')
        .select('id,title,category,price,model_filename,model_size_bytes,preview_path,is_published,created_at')
        .eq('owner_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (result.error) throw result.error;
      data = result.data || [];
    } catch (error) {
      modelList.textContent = '';
      setStatus(`Could not load your uploads: ${error.message}`, 'error');
      return;
    }

    if (!data.length) {
      modelList.innerHTML = '<p class="upload-help">No uploads yet. Add a model above to get started.</p>';
    } else {
      modelList.innerHTML = data.map(row => {
        const preview = client.storage.from(previewBucket).getPublicUrl(row.preview_path);
        return `
          <article class="creator-model-item">
            <img src="${escapeHTML(preview.data.publicUrl)}" alt="" loading="lazy" />
            <div class="creator-model-details">
              <strong>${escapeHTML(row.title)}</strong>
              <span>${escapeHTML(row.model_filename)} · ${formatBytes(Number(row.model_size_bytes))}</span>
              <span class="creator-model-status">${row.is_published ? 'Published on marketplace' : 'Private draft'}</span>
            </div>
            <div class="creator-model-actions">
              <button class="btn btn-outline btn-sm" type="button" data-model-action="publish" data-model-id="${escapeHTML(row.id)}" data-published="${row.is_published}">
                ${row.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button class="btn btn-ghost btn-sm" type="button" data-model-action="delete" data-model-id="${escapeHTML(row.id)}">Delete</button>
            </div>
          </article>
        `;
      }).join('');
    }

    await loadPublicModels();
  }

  function openPanel() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('upload-close').focus();
  }

  function closePanel() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  async function removeObjects(paths, bucket) {
    if (!paths.length) return;
    const { error } = await client.storage.from(bucket).remove(paths);
    if (error) throw error;
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!currentUser) {
      setStatus('Sign in before uploading a model.', 'error');
      return;
    }

    const form = new FormData(uploadForm);
    const title = String(form.get('title') || '').trim();
    const description = String(form.get('description') || '').trim();
    const category = String(form.get('category') || '');
    const price = Number(form.get('price'));
    const modelFile = form.get('model');
    const previewFile = form.get('preview');
    const extension = modelFile.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.has(extension)) {
      setStatus('Choose a supported 3D file: BLEND, FBX, OBJ, STL, GLB, GLTF, 3MF, STEP, or IGES.', 'error');
      return;
    }
    if (modelFile.size === 0 || modelFile.size > maxModelBytes) {
      setStatus('The model file must be between 1 byte and 50 MB.', 'error');
      return;
    }
    if (!allowedImageTypes.has(previewFile.type) || previewFile.size === 0 || previewFile.size > maxPreviewBytes) {
      setStatus('Choose a JPG, PNG, or WebP preview image no larger than 5 MB.', 'error');
      return;
    }
    if (!Number.isFinite(price) || price < 0 || price > 500) {
      setStatus('Enter a price from $0 to $500.', 'error');
      return;
    }

    submitButton.disabled = true;
    setStatus('', 'info');
    const uploadId = crypto.randomUUID();
    const modelPath = `${currentUser.id}/${uploadId}.${extension}`;
    const previewExtension = previewFile.type === 'image/png' ? 'png' : previewFile.type === 'image/webp' ? 'webp' : 'jpg';
    const previewPath = `${currentUser.id}/${uploadId}.${previewExtension}`;
    let modelUploaded = false;
    let previewUploaded = false;

    try {
      setProgress('Uploading private 3D model…');
      const modelResult = await client.storage.from(modelBucket).upload(modelPath, modelFile, {
        contentType: modelFile.type || 'application/octet-stream',
        upsert: false,
      });
      if (modelResult.error) throw modelResult.error;
      modelUploaded = true;

      setProgress('Uploading preview image…');
      const previewResult = await client.storage.from(previewBucket).upload(previewPath, previewFile, {
        contentType: previewFile.type,
        upsert: false,
      });
      if (previewResult.error) throw previewResult.error;
      previewUploaded = true;

      setProgress('Saving your private draft…');
      const { error } = await client.from('jewellery_models').insert({
        owner_id: currentUser.id,
        title,
        description,
        category,
        price,
        model_path: modelPath,
        preview_path: previewPath,
        model_filename: modelFile.name,
        model_size_bytes: modelFile.size,
      });
      if (error) throw error;

      uploadForm.reset();
      document.getElementById('model-price').value = '0';
      clearProgress();
      setStatus('Upload complete. Your listing is private until you choose Publish.', 'success');
      await refreshOwnerUploads();
    } catch (error) {
      const cleanupErrors = [];
      if (previewUploaded) {
        try { await removeObjects([previewPath], previewBucket); }
        catch (cleanupError) { cleanupErrors.push(`preview cleanup failed: ${cleanupError.message}`); }
      }
      if (modelUploaded) {
        try { await removeObjects([modelPath], modelBucket); }
        catch (cleanupError) { cleanupErrors.push(`model cleanup failed: ${cleanupError.message}`); }
      }
      clearProgress();
      const cleanupMessage = cleanupErrors.length ? ` ${cleanupErrors.join('; ')}` : '';
      setStatus(`Upload failed: ${error.message}.${cleanupMessage}`, 'error');
    } finally {
      submitButton.disabled = false;
    }
  }

  async function handleModelAction(event) {
    const button = event.target.closest('[data-model-action]');
    if (!button || !currentUser) return;
    button.disabled = true;
    const modelId = button.dataset.modelId;

    try {
      if (button.dataset.modelAction === 'publish') {
        const isPublished = button.dataset.published === 'true';
        const { error } = await client
          .from('jewellery_models')
          .update({ is_published: !isPublished })
          .eq('id', modelId)
          .eq('owner_id', currentUser.id);
        if (error) throw error;
      } else {
        const { data, error } = await client
          .from('jewellery_models')
          .select('model_path,preview_path')
          .eq('id', modelId)
          .eq('owner_id', currentUser.id)
          .single();
        if (error) throw error;

        await removeObjects([data.model_path], modelBucket);
        await removeObjects([data.preview_path], previewBucket);
        const { error: deleteError } = await client
          .from('jewellery_models')
          .delete()
          .eq('id', modelId)
          .eq('owner_id', currentUser.id);
        if (deleteError) throw deleteError;
      }

      await refreshOwnerUploads();
    } catch (error) {
      button.disabled = false;
      setStatus(`Could not update this listing: ${error.message}`, 'error');
    }
  }

  function init() {
    document.getElementById('nav-creators-btn').addEventListener('click', openPanel);
    document.getElementById('upload-close').addEventListener('click', closePanel);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closePanel();
    });
    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!client) return;
      loginButton.disabled = true;
      const email = document.getElementById('creator-email').value.trim();
      const password = document.getElementById('creator-password').value;
      try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showSignedIn(data.user);
      } catch (error) {
        setStatus(`Sign-in failed: ${error.message}`, 'error');
      } finally {
        loginButton.disabled = false;
      }
    });
    document.getElementById('creator-signout-btn').addEventListener('click', async () => {
      const { error } = await client.auth.signOut();
      if (error) {
        setStatus(`Sign-out failed: ${error.message}`, 'error');
        return;
      }
      showSignedOut();
      setStatus('You are signed out.', 'info');
    });
    uploadForm.addEventListener('submit', handleUpload);
    modelList.addEventListener('click', handleModelAction);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && overlay.classList.contains('open')) closePanel();
    });

    if (!config.url || !config.anonKey) {
      setStatus('Cloud storage is not connected yet. Follow SUPABASE_SETUP.md to create your free project and add its public URL and anon key.', 'warning');
      document.getElementById('upload-setup-link').classList.remove('hidden');
      loginButton.disabled = true;
      return;
    }
    if (!window.supabase?.createClient) {
      setStatus('The Supabase client could not load. Check your internet connection and reload the website.', 'error');
      loginButton.disabled = true;
      return;
    }

    client = window.supabase.createClient(config.url, config.anonKey);
    client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) showSignedIn(session.user);
      else showSignedOut();
    });
    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus(`Could not restore your sign-in: ${error.message}`, 'error');
        return;
      }
      if (data.session?.user) showSignedIn(data.session.user);
      else loadPublicModels().catch(error => {
        console.error('Unable to load community jewellery models:', error);
      });
    });
  }

  window.openCreatorUploadPanel = openPanel;
  document.addEventListener('DOMContentLoaded', init);
})();
