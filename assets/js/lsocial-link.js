// Script cập nhật link mạng xã hội từ file JSON
fetch('./social-links.json', { cache: 'no-cache' })
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        const ct = (response.headers && response.headers.get('content-type')) || '';
        if (ct.indexOf('text/html') !== -1) {
            throw new Error('Expected JSON, got HTML');
        }
        return response.json();
    })
    .then(data => {
        for (const [socialName, url] of Object.entries(data)) {
            // Dùng data-social-id để hợp lệ HTML khi tái sử dụng ở nhiều vị trí (tránh trùng lặp ID)
            const links = document.querySelectorAll(`a[data-social-id="${socialName}"]`);
            links.forEach(link => {
                link.href = url;
            });
        }
    })
    .catch(error => console.error('Lỗi khi tải file social-links.json:', error));
