/**
 *
 * -----------------------------------------------------------------------------
 *
 * Template : Virtuo Personal Portfolio HTML Template
 * Author : themes-park
 * Author URI : https://themes-park.com/
 *
 * -----------------------------------------------------------------------------
 *
 **/

(function ($) {
    'use strict';

    var RECIPIENT_EMAIL = 'doanvannhuthuat@gmail.com';

    function isStaticHost() {
        var host = (window.location && window.location.hostname) || '';
        return window.location.protocol === 'file:' || host.endsWith('github.io');
    }

    function openMailtoFallback(fields) {
        var subjectText = fields.subject
            ? fields.subject
            : ('Liên hệ từ ' + (fields.name || 'Website CV'));
        var bodyLines = [
            'Họ tên: ' + (fields.name || ''),
            'Email: ' + (fields.email || ''),
            fields.phone ? ('Số điện thoại: ' + fields.phone) : '',
            '',
            'Nội dung:',
            fields.message || ''
        ].filter(function (line, idx, arr) {
            return line !== '' || (idx > 0 && arr[idx - 1] !== '');
        });

        var mailtoUrl = 'mailto:' + RECIPIENT_EMAIL
            + '?subject=' + encodeURIComponent(subjectText)
            + '&body=' + encodeURIComponent(bodyLines.join('\n'));

        window.location.href = mailtoUrl;
    }

    function showFallbackSuccess($target, fields) {
        $target.removeClass('error').addClass('success');
        $target.html(
            'GitHub Pages không hỗ trợ PHP nên đã mở trình gửi email tới '
            + '<a href="mailto:' + RECIPIENT_EMAIL + '" style="text-decoration:underline;">' + RECIPIENT_EMAIL + '</a>. '
            + 'Hoặc liên hệ nhanh qua <a href="https://zalo.me/0909600114" target="_blank" rel="noopener" style="text-decoration:underline;">Zalo (0909600114)</a>.'
        );
        openMailtoFallback(fields);
    }

    // Contact form (#contact-form)
    var form = $('#contact-form');
    var formMessages = $('#form-messages');

    $(form).on('submit', function (e) {
        e.preventDefault();

        var fields = {
            name: $.trim($('#contact-name').val() || form.find('[name="name"]').val() || ''),
            phone: $.trim($('#contact-phone').val() || form.find('[name="phone"]').val() || ''),
            email: $.trim($('#contact-email').val() || form.find('[name="email"]').val() || ''),
            subject: $.trim($('#subject').val() || form.find('[name="subject"]').val() || ''),
            message: $.trim($('#contact-message').val() || form.find('[name="message"]').val() || '')
        };

        if (isStaticHost()) {
            showFallbackSuccess($(formMessages), fields);
            $('#contact-name, #contact-phone, #contact-email, #subject, #contact-message').val('');
            return;
        }

        var formData = $(form).serialize();
        $.ajax({
            type: 'POST',
            url: $(form).attr('action'),
            data: formData
        })
            .done(function (response) {
                if (typeof response === 'string' && response.trim().indexOf('<?php') === 0) {
                    showFallbackSuccess($(formMessages), fields);
                } else {
                    $(formMessages).removeClass('error').addClass('success').text(response);
                }
                $('#contact-name, #contact-phone, #contact-email, #subject, #contact-message').val('');
            })
            .fail(function (data) {
                if (data.status === 404 || data.status === 405 || data.status === 0) {
                    showFallbackSuccess($(formMessages), fields);
                    $('#contact-name, #contact-phone, #contact-email, #subject, #contact-message').val('');
                    return;
                }
                $(formMessages).removeClass('success').addClass('error');
                if (data.responseText && data.responseText.indexOf('<!DOCTYPE') === -1) {
                    $(formMessages).text(data.responseText);
                } else {
                    $(formMessages).text('Không thể gửi biểu mẫu lúc này. Vui lòng gửi trực tiếp tới ' + RECIPIENT_EMAIL + '.');
                }
            });
    });

    // Quick chat popup form (.ready-chatting-option form)
    $('.ready-chatting-option form').on('submit', function (e) {
        e.preventDefault();
        var $chatForm = $(this);
        var fields = {
            name: $.trim($chatForm.find('[name="name"]').val() || ''),
            email: $.trim($chatForm.find('[name="email"]').val() || ''),
            subject: 'Tin nhắn nhanh từ Website CV',
            message: $.trim($chatForm.find('[name="message"]').val() || '')
        };

        var $status = $chatForm.find('.chat-form-status');
        if (!$status.length) {
            $status = $('<p class="chat-form-status" style="margin-top:10px;font-size:13px;color:#13fdfd;"></p>');
            $chatForm.append($status);
        }
        $status.text('Đang mở email tới ' + RECIPIENT_EMAIL + ' (hoặc nhắn Zalo 0909600114).');
        openMailtoFallback(fields);
        $chatForm[0].reset();
    });

})(jQuery);
