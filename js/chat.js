// Logique du Chat Équipe (Staff Chat)

let staffName = localStorage.getItem('sofia_staff_name') || '';
let chatUnread = 0;
let isChatOpen = false;
let chatDbRef = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser la base de données si firebase est prêt
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        chatDbRef = firebase.database().ref('staff_chat');
        
        chatDbRef.limitToLast(50).on('child_added', (snapshot) => {
            const msg = snapshot.val();
            displayMessage(msg);
            
            if (!isChatOpen) {
                chatUnread++;
                updateUnreadBadge();
                if (window.playSyncSound) window.playSyncSound('pop');
            }
        });
    } else {
        console.warn("Firebase non initialisé pour le chat d'équipe.");
    }
});

function toggleStaffChat() {
    const chatWindow = document.getElementById('staffChatWindow');
    const input = document.getElementById('staffChatInput');
    
    isChatOpen = !isChatOpen;
    
    if (isChatOpen) {
        if (!staffName) {
            staffName = prompt("Veuillez entrer votre prénom pour le chat :") || "Anonyme";
            localStorage.setItem('sofia_staff_name', staffName);
        }
        
        // Ouvrir avec GSAP
        if (typeof gsap !== 'undefined') {
            gsap.to(chatWindow, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'expo.out'
            });
            chatWindow.style.pointerEvents = 'auto';
        } else {
            chatWindow.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
            chatWindow.classList.add('scale-100', 'opacity-100');
        }
        
        chatUnread = 0;
        updateUnreadBadge();
        input.focus();
        scrollToBottom();
    } else {
        // Fermer avec GSAP
        if (typeof gsap !== 'undefined') {
            gsap.to(chatWindow, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'expo.out',
                onComplete: () => {
                    chatWindow.style.pointerEvents = 'none';
                }
            });
        } else {
            chatWindow.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
            chatWindow.classList.remove('scale-100', 'opacity-100');
        }
    }
}

function sendStaffChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('staffChatInput');
    const text = input.value.trim();
    
    if (!text || !chatDbRef) return;
    
    const message = {
        name: staffName,
        text: text,
        timestamp: Date.now()
    };
    
    chatDbRef.push(message);
    input.value = '';
}

function displayMessage(msg) {
    const messagesArea = document.getElementById('staffChatMessages');
    const isMe = msg.name === staffName;
    
    const time = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const div = document.createElement('div');
    div.className = `flex flex-col max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`;
    
    const nameStr = isMe ? '' : `<span class="text-[10px] text-gray-500 mb-1 ml-1">${msg.name}</span>`;
    const bubbleClass = isMe 
        ? 'bg-gradient-to-r from-adagio-red to-pink-600 text-white rounded-2xl rounded-tr-sm' 
        : 'bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm shadow-sm';
    
    div.innerHTML = `
        ${nameStr}
        <div class="px-4 py-2 ${bubbleClass}">
            <p class="text-sm leading-relaxed break-words">${escapeHTML(msg.text)}</p>
            <div class="text-[9px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}">${time}</div>
        </div>
    `;
    
    messagesArea.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    const messagesArea = document.getElementById('staffChatMessages');
    if (messagesArea) {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

function updateUnreadBadge() {
    const badge = document.getElementById('staffChatUnread');
    if (!badge) return;
    
    if (chatUnread > 0) {
        badge.innerText = chatUnread > 99 ? '99+' : chatUnread;
        badge.classList.remove('hidden');
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(badge, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(1.5)' });
        }
    } else {
        badge.classList.add('hidden');
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

window.toggleStaffChat = toggleStaffChat;
window.sendStaffChatMessage = sendStaffChatMessage;
