// ========== USE localStorage INSTEAD OF JSON SERVER ==========
// This works on Netlify, GitHub Pages, and any static hosting!

let allTips = [];

// Load tips from localStorage when page loads
document.addEventListener('DOMContentLoaded', function() {
    
    if (window.location.pathname.includes('agritips.html') || document.querySelector('.crud-section')) {
        loadTipsFromLocalStorage();
    }
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
        });
    });
    
    setupCRUDListeners();
    setupContactForm();
});

// ========== 1. READ: Load tips from localStorage ==========
function loadTipsFromLocalStorage() {
    const apiStatus = document.getElementById('apiStatus');
    const container = document.getElementById('tipsContainer');
    
    // Check if localStorage has tips
    const storedTips = localStorage.getItem('agricultural_tips');
    
    if (storedTips) {
        allTips = JSON.parse(storedTips);
        if (apiStatus) {
            apiStatus.innerHTML = '<i class="fas fa-check-circle"></i> ✅ Using localStorage - CRUD works on Netlify!';
            apiStatus.style.color = '#4caf50';
        }
    } else {
        // Load default tips
        allTips = [
            { id: 1, title: "🌽 Maize Crop Rotation", description: "Rotate maize with legumes like beans to fix nitrogen in the soil naturally." },
            { id: 2, title: "💧 Smart Water Conservation", description: "Use drip irrigation or mulching to retain soil moisture." },
            { id: 3, title: "🐛 Organic Pest Control", description: "Mix neem oil with water to control fall armyworms." },
            { id: 4, title: "📈 Best Time to Sell Maize", description: "Sell between January and March for highest prices." },
            { id: 5, title: "🥔 Potato Disease Prevention", description: "Use certified seeds and practice crop rotation." }
        ];
        saveTipsToLocalStorage();
        if (apiStatus) {
            apiStatus.innerHTML = '<i class="fas fa-database"></i> ✅ Default tips loaded! CRUD operations will save to localStorage.';
            apiStatus.style.color = '#4caf50';
        }
    }
    
    renderAllTips();
}

// Save tips to localStorage
function saveTipsToLocalStorage() {
    localStorage.setItem('agricultural_tips', JSON.stringify(allTips));
}

// ========== 2. CREATE: Add new tip ==========
async function createTip(title, description) {
    if (!title.trim() || !description.trim()) {
        showMessage('❌ Please fill in both title and description!', 'error');
        return false;
    }
    
    // Get next ID
    const maxId = allTips.length > 0 ? Math.max(...allTips.map(t => t.id)) : 0;
    const newTip = {
        id: maxId + 1,
        title: title.trim(),
        description: description.trim()
    };
    
    allTips.push(newTip);
    saveTipsToLocalStorage();
    renderAllTips();
    showMessage(`✅ Tip "${newTip.title}" created and saved to localStorage!`, 'success');
    return true;
}

// ========== 3. UPDATE: Edit existing tip ==========
async function updateTip(id, newTitle, newDescription) {
    const index = allTips.findIndex(tip => tip.id === parseInt(id));
    if (index !== -1) {
        allTips[index].title = newTitle.trim();
        allTips[index].description = newDescription.trim();
        saveTipsToLocalStorage();
        renderAllTips();
        showMessage(`✅ Tip ID ${id} updated and saved to localStorage!`, 'success');
        return true;
    }
    showMessage('❌ Tip not found!', 'error');
    return false;
}

// ========== 4. DELETE: Remove tip ==========
async function deleteTip(id) {
    const tipToDelete = allTips.find(tip => tip.id === parseInt(id));
    if (!tipToDelete) return false;
    
    if (!confirm(`Are you sure you want to delete "${tipToDelete.title}"?`)) {
        return false;
    }
    
    allTips = allTips.filter(tip => tip.id !== parseInt(id));
    saveTipsToLocalStorage();
    renderAllTips();
    showMessage(`🗑️ Tip deleted! Remaining: ${allTips.length} tips`, 'info');
    return true;
}

// ========== RENDER TIPS ==========
function renderAllTips() {
    const container = document.getElementById('tipsContainer');
    if (!container) return;
    
    if (allTips.length === 0) {
        container.innerHTML = `
            <div class="empty-tips">
                <i class="fas fa-seedling"></i>
                <h3>No Tips Available</h3>
                <p>Create your first agricultural tip using the form above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    allTips.forEach(tip => {
        const tipCard = document.createElement('div');
        tipCard.classList.add('tip-card');
        tipCard.innerHTML = `
            <h3>${escapeHtml(tip.title)}</h3>
            <p>${escapeHtml(tip.description)}</p>
            <div class="tip-meta">
                <small><i class="fas fa-hashtag"></i> ID: ${tip.id}</small>
                <small><i class="fas fa-database"></i> Stored in localStorage</small>
            </div>
            <div class="tip-actions">
                <button class="btn-edit" onclick="openUpdateModal(${tip.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteTip(${tip.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        container.appendChild(tipCard);
    });
}

// ========== OPEN UPDATE MODAL ==========
function openUpdateModal(id) {
    const tip = allTips.find(t => t.id === parseInt(id));
    if (!tip) return;
    
    document.getElementById('updateTipId').value = tip.id;
    document.getElementById('updateTitle').value = tip.title;
    document.getElementById('updateDescription').value = tip.description;
    
    const modal = document.getElementById('updateModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// ========== SETUP EVENT LISTENERS ==========
function setupCRUDListeners() {
    const createForm = document.getElementById('createTipForm');
    if (createForm) {
        createForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const title = document.getElementById('tipTitle').value;
            const description = document.getElementById('tipDescription').value;
            if (await createTip(title, description)) {
                createForm.reset();
            }
        });
    }
    
    const updateForm = document.getElementById('updateTipForm');
    if (updateForm) {
        updateForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('updateTipId').value;
            const title = document.getElementById('updateTitle').value;
            const description = document.getElementById('updateDescription').value;
            if (await updateTip(id, title, description)) {
                closeModal();
            }
        });
    }
    
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('updateModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('updateModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showMessage(message, type) {
    const existingMsg = document.querySelector('.crud-message');
    if (existingMsg) existingMsg.remove();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `crud-message ${type}`;
    msgDiv.innerHTML = message;
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        if (msgDiv) msgDiv.remove();
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        const subject = document.getElementById('subject')?.value;
        const message = document.getElementById('message')?.value.trim();
        const errorSpan = document.getElementById('formError');
        const successMsg = document.getElementById('successMsg');
        
        if (errorSpan) errorSpan.textContent = '';
        if (successMsg) successMsg.textContent = '';
        
        if (!name) {
            if (errorSpan) errorSpan.textContent = '❌ Please enter your full name.';
            return;
        }
        if (!email || !email.includes('@')) {
            if (errorSpan) errorSpan.textContent = '❌ Please enter a valid email address.';
            return;
        }
        if (!phone || phone.length < 10) {
            if (errorSpan) errorSpan.textContent = '❌ Please enter a valid phone number (10+ digits).';
            return;
        }
        if (!subject || subject === '') {
            if (errorSpan) errorSpan.textContent = '❌ Please select a subject.';
            return;
        }
        if (!message || message.length < 10) {
            if (errorSpan) errorSpan.textContent = '❌ Please enter your message (minimum 10 characters).';
            return;
        }
        
        if (successMsg) {
            successMsg.innerHTML = '✅ Thank you ' + name + '! Our team will respond within 24 hours.';
            contactForm.reset();
        }
        
        setTimeout(() => {
            if (successMsg) successMsg.innerHTML = '';
        }, 5000);
    });
}

const exploreBtn = document.getElementById('exploreBtn');
if (exploreBtn) {
    exploreBtn.addEventListener('click', function() {
        window.location.href = 'services.html';
    });
}