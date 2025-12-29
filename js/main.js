/**
 * コパン（COPAN）メインJavaScript
 * インタラクティブ機能の実装
 */

// DOMContentLoadedイベント
document.addEventListener('DOMContentLoaded', function() {
    // 初期化
    initHamburgerMenu();
    initSmoothScroll();
    initScheduleTabs();
    initBackToTop();
    initScrollAnimations();
    initFormValidation();
});

/**
 * ハンバーガーメニューの初期化
 */
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const headerNav = document.getElementById('headerNav');
    
    if (hamburger && headerNav) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            headerNav.classList.toggle('active');
        });
        
        // メニューリンククリックでメニューを閉じる
        const navLinks = headerNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                headerNav.classList.remove('active');
            });
        });
        
        // メニュー外クリックで閉じる
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = headerNav.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnHamburger && headerNav.classList.contains('active')) {
                hamburger.classList.remove('active');
                headerNav.classList.remove('active');
            }
        });
    }
}

/**
 * スムーススクロールの初期化
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // #のみの場合はトップへ
            if (href === '#' || href === '#top') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            // 該当する要素が存在する場合
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * スケジュールタブの初期化
 */
function initScheduleTabs() {
    const tabs = document.querySelectorAll('.schedule-tab');
    const panels = document.querySelectorAll('.schedule-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.getAttribute('data-tab');
            
            // アクティブ状態を切り替え
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

/**
 * トップへ戻るボタンの初期化
 */
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // スクロールイベントでボタンの表示/非表示
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        // ボタンクリックでトップへ
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * スクロールアニメーションの初期化
 */
function initScrollAnimations() {
    // Intersection Observer API を使用
    const observerOptions = {
        root: null,
        rootMargin: '100px', // 要素が画面に入る100px前から発動
        threshold: 0.05 // より早く表示開始
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // アニメーション対象の要素
    const animatedElements = document.querySelectorAll(
        '.feature-card, .program-card, .guide-card, .news-item, .timeline-item'
    );
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`;
        observer.observe(el);
    });
}

/**
 * フォームバリデーションの初期化
 */
function initFormValidation() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        // 電話番号の自動フォーマット
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^\d]/g, '');
                
                if (value.length > 0) {
                    // 0155-66-5395のようなフォーマット
                    if (value.length <= 4) {
                        value = value;
                    } else if (value.length <= 6) {
                        value = value.slice(0, 4) + '-' + value.slice(4);
                    } else {
                        value = value.slice(0, 4) + '-' + value.slice(4, 6) + '-' + value.slice(6, 10);
                    }
                }
                
                e.target.value = value;
            });
        }
        
        // フォーム送信時のバリデーション
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // バリデーションチェック
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();
            
            // エラーメッセージをクリア
            clearFormErrors();
            
            let isValid = true;
            
            // お名前チェック
            if (name === '') {
                showFieldError('name', 'お名前を入力してください');
                isValid = false;
            }
            
            // 電話番号チェック
            if (phone === '') {
                showFieldError('phone', '電話番号を入力してください');
                isValid = false;
            } else if (!/^[\d-]+$/.test(phone)) {
                showFieldError('phone', '正しい電話番号を入力してください');
                isValid = false;
            }
            
            // メールアドレスチェック
            if (email === '') {
                showFieldError('email', 'メールアドレスを入力してください');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showFieldError('email', '正しいメールアドレスを入力してください');
                isValid = false;
            }
            
            // お問い合わせ種類チェック
            if (subject === '') {
                showFieldError('subject', 'お問い合わせ種類を選択してください');
                isValid = false;
            }
            
            // お問い合わせ内容チェック
            if (message === '') {
                showFieldError('message', 'お問い合わせ内容を入力してください');
                isValid = false;
            } else if (message.length < 10) {
                showFieldError('message', 'お問い合わせ内容は10文字以上入力してください');
                isValid = false;
            }
            
            if (isValid) {
                // Googleフォームに送信
                submitToGoogleForm(name, phone, email, subject, message);
                // 送信成功メッセージ
                showSuccessMessage();
                // フォームをリセット
                form.reset();
            } else {
                // エラーがある場合は最初のエラーフィールドにスクロール
                const firstError = form.querySelector('.form-error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
}

/**
 * Googleフォームに送信
 */
function submitToGoogleForm(name, phone, email, subject, message) {
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfq22gmsV2_tf86juFlUWMZKhYUx2KF5gjZU_pnpK5WEh6jsw/formResponse';
    
    // Googleフォームのentry IDにマッピング
    const formData = new FormData();
    formData.append('entry.701446373', name);           // お名前
    formData.append('entry.578679617', phone);          // 電話番号
    formData.append('entry.173954784', email);          // メールアドレス
    formData.append('entry.835707395', subject);        // お問い合わせ種類
    formData.append('entry.613536919', message);        // お問い合わせ内容
    
    // Googleフォームに送信（no-corsモードで送信）
    fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    }).then(function() {
        console.log('フォームが正常に送信されました');
    }).catch(function(error) {
        console.log('フォーム送信エラー:', error);
    });
}

/**
 * フィールドエラーを表示
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        const formGroup = field.closest('.form-group');
        
        // エラーメッセージ要素を作成
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.color = '#FF6B6B';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '8px';
        errorDiv.textContent = message;
        
        // フィールドにエラースタイルを適用
        field.style.borderColor = '#FF6B6B';
        
        // エラーメッセージを追加
        formGroup.appendChild(errorDiv);
    }
}

/**
 * フォームエラーをクリア
 */
function clearFormErrors() {
    const errorMessages = document.querySelectorAll('.form-error');
    errorMessages.forEach(error => error.remove());
    
    const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    formInputs.forEach(input => {
        input.style.borderColor = '#E0E0E0';
    });
}

/**
 * 送信成功メッセージを表示
 */
function showSuccessMessage() {
    const form = document.getElementById('contactForm');
    
    // 成功メッセージを作成
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.style.cssText = `
        background: linear-gradient(135deg, #7FD8BE 0%, #98E5CF 100%);
        color: white;
        padding: 24px;
        border-radius: 20px;
        text-align: center;
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 30px;
        box-shadow: 0 4px 16px rgba(127, 216, 190, 0.3);
    `;
    successDiv.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
        お問い合わせありがとうございます！<br>
        <span style="font-size: 0.95rem; font-weight: 400; opacity: 0.95;">
            担当者より折り返しご連絡させていただきます。
        </span>
    `;
    
    // フォームの前に成功メッセージを挿入
    form.parentNode.insertBefore(successDiv, form);
    
    // 成功メッセージにスクロール
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 5秒後にメッセージを削除
    setTimeout(() => {
        successDiv.style.transition = 'opacity 0.5s ease';
        successDiv.style.opacity = '0';
        setTimeout(() => {
            successDiv.remove();
        }, 500);
    }, 5000);
}

/**
 * ヘッダーのスクロール時の背景変更
 */
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.pageYOffset > 100) {
        header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    }
});
