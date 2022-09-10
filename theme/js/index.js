String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function(m,i){
            return args[i];
        }
    );
}

String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var Preview = {
    preview: null,     // filled in by Init below
    Update: function (obj) {
        var ele = $(obj),
            parentdiv = ele.parent().parent(),
            preview = parentdiv.children(".MathPreview").eq(0),
            pid = preview.attr("id"),
            previewEle = document.getElementById(pid),
            text = ele.val();
        MathJax.Hub.Config({
            messageStyle: "none"
        });
        preview.html("`" + text + "`");
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, previewEle]);
    }
};

/**
 * 回到顶部
 */
function backToTop() {
    //滚页面才显示返回顶部
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        if (scroll > 100) {
            $("#top").fadeIn(500);
        } else {
            $("#top").fadeOut(500);
        }
    });
    //点击回到顶部
    $("#top").click(function() {
        $("html,body").animate({
            scrollTop: "0"
        }, 500);
    });
    
    $(".table-nav").css({top: $(window).scrollTop()+150});
}

var error_times = 0;

function checkQuiz(obj, id) {
    var value,
        your_answer,
        back_check = false,
        problem = $($(obj).parents('.process')[0]),
        eleparent = $(obj).parent(),
        ele = problem.children().children(".quiz"),
        type = ele.attr("type"),
        lesson_name = eleparent.parent()[0].className,
        lesson_id = parseInt(lesson_name.substr(13)),
        correct = eleparent.children(".answers").val(),
        comments = eleparent.children(".comments");

    if (type === "radio") {
        ele.each(function() {
            if ($(this).prop('checked') === true) {
                value = $(this).val();
            }
        });
    } else if (type === "checkbox") {

        value = '';

        ele.each(function() {
            if ($(this).prop('checked') === true) {
                value += $(this).val()+"@";
            }
        });

        value = value.substring(0, value.length-1);

    } else if (type === "text") {
        value = ele.val();
    }

    if (type === "text" && ele.hasClass("formula")) {
        var expression = ele.val();
        console.log("暂不支持公式");
    } else {
        your_answer = value;

        if (your_answer === correct) {
            $('.hint').css('display', 'block');
            $('.flashes').html("<li>恭喜答案正确</li>");
            error_times = 0;
            setTimeout("$('.hint').fadeOut('slow')", 5000)
            $("body").animate({
                scrollTop: $(problem).offset().top + $(problem).height() - 55
            }, 500);
        } else {
            $('.hint').css('display', 'block');
            $('.flashes').html('');
            $('.flashes').append("<li>对不起， 答案错误</li>")
            $('.flashes').append("<li>提示:</li>")

            if (comments === "undefined") {
                comments = "无提示";
            }
            else {
                comments = comments.val();
            }

            comments = comments.split('#');
            if (error_times >= comments.length)
                $('.flashes').append("<li>"+comments+"</li>");
            else
                $('.flashes').append("<li>"+comments[error_times]+"</li>");
            error_times++;
            setTimeout("$('.hint').fadeOut('slow')", 5000)
        }
    }
}


function initScrollSpy () {
    var tocSelector = '.table-of-content';
    var $tocElement = $(tocSelector);
    var activeCurrentSelector = '.active-current';

    $tocElement
      .on('activate.bs.scrollspy', function () {
        var $currentActiveElement = $(tocSelector + ' .active').last();
        removeCurrentActiveClass();
        $currentActiveElement.addClass('active-current');
      })
      .on('clear.bs.scrollspy', removeCurrentActiveClass);

    $('body').scrollspy({ target: tocSelector });

    function removeCurrentActiveClass () {
      $(tocSelector + ' ' + activeCurrentSelector)
        .removeClass(activeCurrentSelector.substring(1));
    }
}

function renderQuoteTip() {
    var container = $(".article-content"), 
        ps = container.children("p"),
        alist = ps.children("a"),
        imglist = ps.children("img"),
        html = container.html();

    if (alist.length) {

    }
    if (imglist.length) {
        var a = $('<a href="javascript:void(0)" data-toggle="popover" data-placement="top" data-trigger="hover">$1</a>');
        a.attr("class", "bind_hover_card");
        a.attr('data-content', '<img src="{0}"/>');
        for (var i in imglist) {
            var alt = imglist[i].alt;
            var href = imglist[i].src;
            var reg = new RegExp("\\b({0})([^'\".])".format(alt), "g");
            html = html.replace(reg, a[0].outerHTML.format(href) + "$2");
        }
    }
    container.html(html);

    $("[data-toggle='popover']").popover({
        html: true,
        title: "",
        delay: {show:100, hide:100}
    });  
    
    // .popover();
}
