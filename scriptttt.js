// script.js

document.addEventListener('DOMContentLoaded', function() {
    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    // Обновляем год в футере
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Получаем все нужные элементы
    const gallery = document.getElementById('image-gallery');
    const imageCards = document.querySelectorAll('.image-card');
    const imageCounter = document.getElementById('image-counter');
    const totalLikesSpan = document.getElementById('total-likes');
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Состояние лайков (используем Object для хранения состояний по ID)
    let likesState = {};

    // ==================== ФУНКЦИИ ОБНОВЛЕНИЯ СТАТИСТИКИ ====================
    function updateImageCounter() {
        if (imageCounter) {
            // Считаем только видимые карточки (для фильтрации)
            const visibleCards = document.querySelectorAll('.image-card:not([style*="display: none"])');
            imageCounter.textContent = visibleCards.length;
        }
    }

    function updateTotalLikes() {
        if (totalLikesSpan) {
            let total = 0;
            // Суммируем лайки только для видимых карточек
            document.querySelectorAll('.image-card:not([style*="display: none"]) .like-count').forEach(likeSpan => {
                total += parseInt(likeSpan.textContent) || 0;
            });
            totalLikesSpan.textContent = total;
        }
    }

    // Функция для обновления всей статистики
    function updateAllStats() {
        updateImageCounter();
        updateTotalLikes();
    }

    // ==================== РАБОТА С ЛАЙКАМИ ====================
    function initializeLikes() {
        document.querySelectorAll('.like-btn').forEach(button => {
            const cardId = button.dataset.id;
            const likeCountSpan = button.querySelector('.like-count');
            const heartIcon = button.querySelector('i');
            
            // Загружаем сохраненное состояние или ставим 0
            if (!(cardId in likesState)) {
                likesState[cardId] = 0;
            }
            
            // Устанавливаем начальное значение
            likeCountSpan.textContent = likesState[cardId];
            
            // Убираем старый обработчик и добавляем новый
            button.removeEventListener('click', handleLikeClick);
            button.addEventListener('click', handleLikeClick);
        });
        updateTotalLikes();
    }

    // Обработчик клика по лайку
    function handleLikeClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const button = event.currentTarget;
        const cardId = button.dataset.id;
        const likeCountSpan = button.querySelector('.like-count');
        const heartIcon = button.querySelector('i');
        
        // Увеличиваем счетчик
        likesState[cardId] = (likesState[cardId] || 0) + 1;
        likeCountSpan.textContent = likesState[cardId];
        
        // Анимация (мигание сердечка)
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        heartIcon.style.color = '#ff4444';
        
        // Через 200мс возвращаем обратно (но оставляем закрашенным, так как лайк уже поставлен)
        setTimeout(() => {
            heartIcon.style.color = '';
            // Можно оставить закрашенным, если нужно показывать, что лайк уже был поставлен
            // Но по условию задачи лайк можно ставить много раз, поэтому оставляем 'fas'
        }, 200);
        
        // Обновляем общее количество лайков
        updateTotalLikes();
        
        // Сохраняем состояние в localStorage (по желанию)
        // localStorage.setItem('likesState', JSON.stringify(likesState));
    }

    // ==================== ПЕРЕКЛЮЧЕНИЕ ВИДА (СЕТКА/СПИСОК) ====================
    if (gridViewBtn && listViewBtn && gallery) {
        gridViewBtn.addEventListener('click', function() {
            gallery.classList.remove('list-layout');
            gallery.classList.add('gallery-grid'); // Убеждаемся, что класс сетки есть
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        });
        
        listViewBtn.addEventListener('click', function() {
            gallery.classList.add('list-layout');
            gallery.classList.remove('gallery-grid'); // Убираем класс сетки (опционально)
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
        });
    }

    // ==================== ФИЛЬТРАЦИЯ ПО КАТЕГОРИЯМ ====================
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            const filterValue = this.dataset.filter;
            
            // Фильтруем карточки
            imageCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'flex'; // или 'block' в зависимости от ваших стилей
                } else {
                    const cardCategory = card.dataset.category;
                    if (cardCategory === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
            
            // Обновляем статистику после фильтрации
            updateAllStats();
        });
    });

    // ==================== УВЕЛИЧЕНИЕ (ZOOM) ИЗОБРАЖЕНИЙ ====================
    function setupZoomButtons() {
        document.querySelectorAll('.zoom-btn').forEach(btn => {
            btn.removeEventListener('click', handleZoom);
            btn.addEventListener('click', handleZoom);
        });
    }

    function handleZoom(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const card = event.currentTarget.closest('.image-card');
        const img = card.querySelector('.gallery-img');
        const imgSrc = img.src;
        const imgAlt = img.alt;
        
        // Создаем модальное окно для увеличенного изображения
        const modal = document.createElement('div');
        modal.className = 'zoom-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            cursor: pointer;
        `;
        
        const modalImg = document.createElement('img');
        modalImg.src = imgSrc;
        modalImg.alt = imgAlt;
        modalImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
        `;
        
        modal.appendChild(modalImg);
        
        // Закрытие по клику
        modal.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Закрытие по ESC
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                document.removeEventListener('keydown', escHandler);
            }
        });
        
        document.body.appendChild(modal);
    }

    // ==================== ИСПРАВЛЕНИЕ ОШИБОК В РАЗМЕТКЕ ====================
    // Исправляем опечатку "loaidng" -> "loading"
    document.querySelectorAll('img[loaidng="lazy"]').forEach(img => {
        img.setAttribute('loading', 'lazy');
    });
    
    // Исправляем опечатку "fat fa-calendar" -> "far fa-calendar"
    document.querySelectorAll('.fat.fa-calendar').forEach(el => {
        el.classList.remove('fat');
        el.classList.add('far');
    });

    // ==================== ЗАПУСК ПРИ ЗАГРУЗКЕ ====================
    initializeLikes();
    setupZoomButtons();
    updateAllStats();
    
    // Если есть сохраненное состояние лайков из localStorage (раскомментировать, если нужно)
    /*
    const savedLikes = localStorage.getItem('likesState');
    if (savedLikes) {
        likesState = JSON.parse(savedLikes);
        // Обновить отображение лайков
        Object.keys(likesState).forEach(id => {
            const likeSpan = document.querySelector(`.like-btn[data-id="${id}"] .like-count`);
            if (likeSpan) {
                likeSpan.textContent = likesState[id];
            }
        });
        updateTotalLikes();
    }
    */
    
    console.log('Скрипт галереи успешно загружен!');
});