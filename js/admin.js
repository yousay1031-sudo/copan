/**
 * コパン管理画面 JavaScript
 * お知らせ管理システム
 */

// 管理者パスワード（本番環境では環境変数などに変更してください）
const ADMIN_PASSWORD = 'copan2025';

// LocalStorageキー
const STORAGE_KEY = 'copan_news';
const AUTH_KEY = 'copan_auth';

/**
 * ページ読み込み時の初期化
 */
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupLoginForm();
    setupNewsForm();
    
    // 今日の日付をデフォルトに設定
    document.getElementById('newsDate').valueAsDate = new Date();
});

/**
 * 認証チェック
 */
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem(AUTH_KEY);
    
    if (isAuthenticated === 'true') {
        showAdminPanel();
    } else {
        showLoginPanel();
    }
}

/**
 * ログインパネルを表示
 */
function showLoginPanel() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
}

/**
 * 管理パネルを表示
 */
function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
    loadNewsList();
}

/**
 * ログインフォームのセットアップ
 */
function setupLoginForm() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem(AUTH_KEY, 'true');
            errorMessage.style.display = 'none';
            showAdminPanel();
        } else {
            errorMessage.style.display = 'block';
            document.getElementById('password').value = '';
        }
    });
}

/**
 * ログアウト
 */
function logout() {
    if (confirm('ログアウトしますか？')) {
        sessionStorage.removeItem(AUTH_KEY);
        showLoginPanel();
        document.getElementById('password').value = '';
    }
}

/**
 * お知らせデータを取得
 */
function getNewsData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * お知らせデータを保存
 */
function saveNewsData(newsArray) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newsArray));
    // フロントページとデータを同期
    syncWithFrontPage(newsArray);
}

/**
 * フロントページとデータを同期
 */
function syncWithFrontPage(newsArray) {
    // 公開中のお知らせのみをフィルタ
    const publishedNews = newsArray
        .filter(item => item.status === 'published')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3); // 最新3件
    
    localStorage.setItem('copan_public_news', JSON.stringify(publishedNews));
}

/**
 * お知らせ一覧を読み込み
 */
function loadNewsList() {
    const newsList = getNewsData();
    const container = document.getElementById('newsList');
    
    if (newsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>お知らせがありません</h3>
                <p>「新規お知らせを追加」ボタンから追加してください</p>
            </div>
        `;
        return;
    }
    
    // 日付順にソート（新しい順）
    newsList.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = newsList.map((item, index) => {
        const date = new Date(item.date);
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        
        let labelClass = 'label-info';
        if (item.category === 'イベント') {
            labelClass = 'label-event';
        } else if (item.status === 'draft') {
            labelClass = 'label-draft';
        }
        
        const statusText = item.status === 'draft' ? ' (下書き)' : '';
        
        return `
            <div class="news-item">
                <div class="news-content">
                    <div class="news-date">${formattedDate}</div>
                    <span class="news-label ${labelClass}">${item.category}${statusText}</span>
                    <div class="news-title">${item.title}</div>
                </div>
                <div class="news-actions-btns">
                    <button class="edit-btn" onclick="editNews(${index})">
                        <i class="fas fa-edit"></i> 編集
                    </button>
                    <button class="delete-btn" onclick="deleteNews(${index})">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * モーダルを開く
 */
function openModal(editIndex = null) {
    const modal = document.getElementById('newsModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('newsForm');
    
    form.reset();
    document.getElementById('newsDate').valueAsDate = new Date();
    document.getElementById('editId').value = '';
    
    if (editIndex !== null) {
        // 編集モード
        const newsList = getNewsData();
        const item = newsList[editIndex];
        
        modalTitle.textContent = 'お知らせを編集';
        document.getElementById('editId').value = editIndex;
        document.getElementById('newsDate').value = item.date;
        document.getElementById('newsCategory').value = item.category;
        document.getElementById('newsTitle').value = item.title;
        document.getElementById('newsStatus').value = item.status;
    } else {
        // 新規作成モード
        modalTitle.textContent = 'お知らせを追加';
    }
    
    modal.style.display = 'flex';
}

/**
 * モーダルを閉じる
 */
function closeModal() {
    document.getElementById('newsModal').style.display = 'none';
}

/**
 * お知らせフォームのセットアップ
 */
function setupNewsForm() {
    document.getElementById('newsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editId = document.getElementById('editId').value;
        const newsData = {
            date: document.getElementById('newsDate').value,
            category: document.getElementById('newsCategory').value,
            title: document.getElementById('newsTitle').value,
            status: document.getElementById('newsStatus').value
        };
        
        let newsList = getNewsData();
        
        if (editId !== '') {
            // 編集
            newsList[parseInt(editId)] = newsData;
        } else {
            // 新規追加
            newsList.push(newsData);
        }
        
        saveNewsData(newsList);
        closeModal();
        loadNewsList();
        
        alert(editId !== '' ? 'お知らせを更新しました' : 'お知らせを追加しました');
    });
}

/**
 * お知らせを編集
 */
function editNews(index) {
    openModal(index);
}

/**
 * お知らせを削除
 */
function deleteNews(index) {
    if (!confirm('このお知らせを削除しますか？')) {
        return;
    }
    
    let newsList = getNewsData();
    newsList.splice(index, 1);
    saveNewsData(newsList);
    loadNewsList();
    
    alert('お知らせを削除しました');
}

/**
 * モーダル外クリックで閉じる
 */
document.getElementById('newsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});
