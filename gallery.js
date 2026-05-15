// Gallery functions
function openGallery() {
    const galleryContainer = document.getElementById('galleryContainer');
    galleryContainer.innerHTML = '';

    if (gameState.discoveredPictures.length === 0) {
        galleryContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #95a5a6;">No pictures discovered yet. Explore to find weird pictures!</p>';
    } else {
        gameState.discoveredPictures.forEach(pic => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.onclick = () => openPictureView(pic.id);
            item.innerHTML = `
                <img src="${pic.image}" alt="${pic.name}">
                <p>${pic.name}</p>
                <small>${pic.comments.length} comments</small>
            `;
            galleryContainer.appendChild(item);
        });
    }

    document.getElementById('galleryModal').classList.remove('hidden');
    document.getElementById('pictureModal').classList.add('hidden');
    gameState.gameRunning = false;
}

function closeGallery() {
    document.getElementById('galleryModal').classList.add('hidden');
    document.getElementById('pictureModal').classList.add('hidden');
    gameState.gameRunning = true;
}

function openPictureView(pictureId) {
    const picture = gameState.discoveredPictures.find(p => p.id === pictureId);
    if (!picture) return;

    document.getElementById('pictureTitle').textContent = picture.name;
    document.getElementById('pictureImage').src = picture.image;

    const commentsDiv = document.getElementById('comments');
    commentsDiv.innerHTML = '';

    if (picture.comments.length === 0) {
        commentsDiv.innerHTML = '<p style="color: #95a5a6; text-align: center;">No comments yet. Be the first!</p>';
    } else {
        picture.comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.className = 'comment';
            commentEl.innerHTML = `
                <div class="comment-author">${comment.author}</div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
            `;
            commentsDiv.appendChild(commentEl);
        });
    }

    document.getElementById('commentInput').value = '';
    document.getElementById('commentInput').dataset.pictureId = pictureId;
    document.getElementById('galleryModal').classList.add('hidden');
    document.getElementById('pictureModal').classList.remove('hidden');
}

function closePicture() {
    document.getElementById('pictureModal').classList.add('hidden');
    document.getElementById('galleryModal').classList.add('hidden');
    gameState.gameRunning = true;
}

function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    const pictureId = input.dataset.pictureId;

    if (!text) return;

    const picture = gameState.discoveredPictures.find(p => p.id === pictureId);
    if (!picture) return;

    const names = [
        'Rose Wanderer', 'Pixel Explorer', 'Art Seeker', 'Gallery Ghost', 'Mystery Collector',
        'Dream Wanderer', 'Cosmic Traveler', 'Forest Dweller', 'Temple Scholar', 'Void Navigator'
    ];
    const author = names[Math.floor(Math.random() * names.length)];

    picture.comments.push({
        author: author,
        text: text
    });

    input.value = '';
    openPictureView(pictureId);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Allow Enter key to post comment
document.addEventListener('DOMContentLoaded', () => {
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                addComment();
            }
        });
    }
});
