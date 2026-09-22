// Configuration Firebase
const firebaseConfig = {
    authDomain: "sofia-v3.firebaseapp.com",
    databaseURL: "https://sofia-v3-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "sofia-v3.firebasestorage.app",
};

// Initialisation
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const proceduresRef = db.ref('procedures');

let currentProcedures = {};

// 1. Password Protection (Basic Client-Side)
function checkPassword() {
    const pwd = document.getElementById('adminPassword').value;
    if (pwd === 'Adagio2025' || pwd === 'admin123') { // Very basic protection
        document.getElementById('loginOverlay').classList.add('hidden');
        document.getElementById('adminApp').classList.remove('hidden');
        loadProcedures();
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

// 2. Load Procedures from Firebase
function loadProcedures() {
    proceduresRef.on('value', (snapshot) => {
        const tbody = document.getElementById('proceduresList');
        tbody.innerHTML = ''; // Clear table
        
        currentProcedures = snapshot.val() || {};
        
        if (Object.keys(currentProcedures).length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-400">Aucune procédure trouvée. Créez-en une nouvelle !</td></tr>';
            return;
        }

        // Sort by category then title
        const procArray = Object.keys(currentProcedures).map(key => ({
            id: key,
            ...currentProcedures[key]
        })).sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return a.title.localeCompare(b.title);
        });

        procArray.forEach(proc => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition-colors';
            
            // Map colors to hex/bg classes for admin display
            const colorBg = `bg-${proc.color}-100`;
            const colorText = `text-${proc.color}-600`;
            
            tr.innerHTML = `
                <td class="p-4">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-lg">
                        <i class="${proc.icon}"></i>
                    </div>
                </td>
                <td class="p-4">
                    <p class="font-bold text-slate-800">${proc.title}</p>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-1">${proc.shortDesc}</p>
                </td>
                <td class="p-4">
                    <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">${proc.category}</span>
                </td>
                <td class="p-4">
                    <span class="capitalize text-xs font-bold text-slate-600 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full block bg-${proc.color}-500"></span>
                        ${proc.color}
                    </span>
                </td>
                <td class="p-4 text-right space-x-2">
                    <button onclick="editProcedure('${proc.id}')" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProcedure('${proc.id}')" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

// 0. Initialiser Quill
let quill;
document.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['clean']
            ]
        }
    });
});

// 3. Form Handling
function openForm() {
    document.getElementById('procedureForm').reset();
    document.getElementById('procId').value = '';
    document.getElementById('formTitle').innerText = 'Ajouter une fiche';
    document.getElementById('iconPreview').innerHTML = '<i class="fas fa-star"></i>';
    if (quill) quill.root.innerHTML = '';
    document.getElementById('formModal').classList.remove('hidden');
}

function closeForm() {
    document.getElementById('formModal').classList.add('hidden');
}

function editProcedure(id) {
    const proc = currentProcedures[id];
    if (!proc) return;

    document.getElementById('procId').value = id;
    document.getElementById('procTitle').value = proc.title;
    document.getElementById('procCategory').value = proc.category;
    document.getElementById('procIcon').value = proc.icon;
    document.getElementById('procColor').value = proc.color;
    document.getElementById('procLabel').value = proc.label;
    document.getElementById('procShortDesc').value = proc.shortDesc;
    
    if (quill) quill.root.innerHTML = proc.contentHtml || '';
    
    document.getElementById('iconPreview').innerHTML = `<i class="${proc.icon}"></i>`;
    document.getElementById('formTitle').innerText = 'Modifier la fiche';
    
    document.getElementById('formModal').classList.remove('hidden');
}

function saveProcedure() {
    const id = document.getElementById('procId').value;
    
    // Check required fields
    const form = document.getElementById('procedureForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const contentHtml = quill ? quill.root.innerHTML : '';

    const procedureData = {
        title: document.getElementById('procTitle').value,
        category: document.getElementById('procCategory').value,
        icon: document.getElementById('procIcon').value,
        color: document.getElementById('procColor').value,
        label: document.getElementById('procLabel').value,
        shortDesc: document.getElementById('procShortDesc').value,
        contentHtml: contentHtml,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    };

    let savePromise;
    if (id) {
        // Update existing
        savePromise = proceduresRef.child(id).update(procedureData);
    } else {
        // Create new (generate specific ID format for better URL/ID management, e.g., "factu-ancv")
        // But for simplicity, let firebase generate a push ID, or generate one based on category and title.
        const newRef = proceduresRef.push();
        savePromise = newRef.set(procedureData);
    }

    savePromise.then(() => {
        closeForm();
        showStatus('Fiche enregistrée avec succès !', 'success');
    }).catch(error => {
        console.error("Error saving: ", error);
        showStatus('Erreur lors de la sauvegarde.', 'error');
    });
}

function deleteProcedure(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette fiche définitivement ?")) {
        proceduresRef.child(id).remove()
            .then(() => showStatus('Fiche supprimée.', 'success'))
            .catch(error => showStatus('Erreur de suppression.', 'error'));
    }
}

function showStatus(msg, type) {
    const statusEl = document.getElementById('statusMsg');
    statusEl.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
    
    if (type === 'success') {
        statusEl.classList.add('bg-green-100', 'text-green-800');
        statusEl.querySelector('i').className = 'fas fa-check-circle text-green-500';
    } else {
        statusEl.classList.add('bg-red-100', 'text-red-800');
        statusEl.querySelector('i').className = 'fas fa-exclamation-triangle text-red-500';
    }
    
    statusEl.querySelector('span').innerText = msg;
    
    setTimeout(() => {
        statusEl.classList.add('hidden');
    }, 4000);
}
