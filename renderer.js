
const editor    = document.getElementById('editor');    
const filepath  = document.getElementById('filepath');  
const statusbar = document.getElementById('statusbar'); 
const theme = await globalThis.api.getPreference('preferences.theme', 'dark');


document.body.dataset.theme = theme;


document.getElementById('btn-theme').addEventListener('click', async () => {

 
  const current = document.body.dataset.theme || 'dark';

  
  const next = current === 'dark' ? 'light' : 'dark';

 
  document.body.dataset.theme = next;

  
  await globalThis.api.setPreference('preferences.theme', next);


  statusbar.textContent = `Thème ${next} activé`;
});



document.getElementById('btn-open')
  .addEventListener('click', async () => {

    
    const chemin = await globalThis.api.ouvrir();

    if (chemin) {
      
      filepath.textContent  = chemin;
      statusbar.textContent = `Fichier ouvert : ${chemin}`;
    }

  });



document.getElementById('btn-save')
  .addEventListener('click', async () => {
    
    const contenu = editor.value;
  
    if (!contenu.trim()) {
      statusbar.textContent = '⚠️ Rien à sauvegarder.';
      return; 
    }

    await globalThis.api.sauvegarder(contenu);
    statusbar.textContent = 'Fichier sauvegardé ✔';
  });

document.getElementById('btn-clear')
  .addEventListener('click', () => {
    editor.value          = '';
    filepath.textContent  = 'Aucun fichier ouvert';
    statusbar.textContent = 'Éditeur effacé';
  });

globalThis.api.onFileOpened(({ content, filePath }) => {
  editor.value          = content;   
  filepath.textContent  = filePath;  
  statusbar.textContent = 'Fichier chargé ✔';
});


globalThis.api.onMenuSave(async () => {
  const contenu = editor.value;

  if (!contenu.trim()) {
    statusbar.textContent = '⚠️ Rien à sauvegarder.';
    return;
  }

  await globalThis.api.sauvegarder(contenu);
  statusbar.textContent = 'Fichier sauvegardé ✔';
});


editor.addEventListener('input', () => {
  const n = editor.value.length;
  statusbar.textContent = `${n} caractère${n > 1 ? 's' : ''}`;
});
