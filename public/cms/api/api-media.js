// api-media.js
/**
 * ******************************************************
 * MEDIA API – SAFE VERSION (NO MODULE, NO IMPORT)

(function () {
    class MediaAPI {
        constructor() {
            // MOCK DATA – lấy nguyên từ media.html
            this.mediaData = [
                { id: 1, url: 'https://i.postimg.cc/3w6k7N9y/post-thumb-1.jpg', createdAt: '08/12/2025' },
                { id: 2, url: 'https://i.postimg.cc/85zK23rL/post-thumb-2.jpg', createdAt: '05/12/2025' },
                { id: 3, url: 'https://i.postimg.cc/mkxV9gH2/post-thumb-3.jpg', createdAt: '28/11/2025' },
                { id: 4, url: 'https://i.postimg.cc/vT45N3Jp/post-thumb-4.jpg', createdAt: '15/11/2025' },
                { id: 5, url: 'https://i.postimg.cc/VvFj0vXz/admin-avatar.jpg', createdAt: '01/11/2025' },
                { id: 6, url: 'https://i.postimg.cc/7b4MF0XW/logo-colored.png', createdAt: '20/10/2025' },
            ];
        }

        /**
         * [READ]
         */
        getAllMedia() {
            return [...this.mediaData]; // clone cho an toàn
        }

        /**
         * [CREATE]
         */
        uploadMedia(tempUrl, fileName) {
            const newId =
                this.mediaData.length > 0
                    ? Math.max(...this.mediaData.map(m => m.id)) + 1
                    : 1;

            const newMedia = {
                id: newId,
                url: tempUrl,
                createdAt: new Date().toLocaleDateString('vi-VN'),
            };

            this.mediaData.unshift(newMedia);

            console.log(`[MOCK MEDIA API] Uploaded: ${fileName}`);
            return newMedia;
        }

        /**
         * [DELETE]
         */
        deleteMedia(id) {
            const before = this.mediaData.length;
            this.mediaData = this.mediaData.filter(m => m.id !== id);
            return this.mediaData.length < before;
        }
    }

    // 👉 EXPORT RA GLOBAL (GIỐNG comments)
    window.mediaAPI = new MediaAPI();
})();
