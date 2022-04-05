var cellobjs = new Array();
var models = ["ccl_fe", "mccl_fe", "ccl_tal", "mccl_tal", "ccl_uni", "mccl_uni", "ccl_hos", "mccl_hos", "dt_fe", "dt_tal", "dt_uni", "dt_hos", "ccl_hoos", "mccl_hoos", "dt_rk4", "dt_hoos"];

class CellObj {
    constructor(root, dirname, model, graphs, c_time) {
        this.root = root;
        this.dirname = dirname;
        this.model = models[model - 1];
        this.graphs = JSON.parse(graphs);
        this.c_time = c_time;
        this.obj = $(`
            <div class="cellobj" id="cellobj%s">
            <h3>%n</h3>
            </div>
        `.replace("%s", dirname).replace("%n", this.dirname + "@" + this.model));
//         console.log(this.graphs);
        for (var i = 0, len = this.graphs.length; i < len; i++) {
            var str = this.graphs[i];
//             console.log(str);
            if (str === "1" || str === 1) {
                // console.log("======")
                continue;
            }
            var img = `<img src="data:image/png;base64,%s" class="cellimg"/>`.replace("%s", str);
            this.obj.append(img);
        }
        this.root.append(this.obj);
        cellobjs.push(this);
    }
}

$(".runbtn").click(function () {

    // console.log("RUNRUNRUN");
    var gps = $("[name='gp']");
    var gpcho = "";
    for (var i = 0; i < gps.length; i++) {
        var gp = gps[i];
        if (gp.checked) {
            gpcho += "1";
        } else {
            gpcho += "0";
        }
    }
    // console.log(gpcho);

    var sets = $("[name='set']");
    var setcho = "";
    for (var i = 0; i < sets.length; i++) {
        var set = sets[i];
        if (set.checked) {
            setcho += "1";
        } else {
            setcho += "0";
        }
    }
    // console.log(setcho);

    var dirname = "default";

    if ($("#defaultdirname")[0].checked) {
        // console.log("使用自定义文件名");
        var name = prompt("请输入想使用的文件夹名", "");
        if (name != null && name !== "")
            dirname = name;
    } else {
        // console.log("使用默认文件名");
    }

    var r = confirm("确认执行模拟");

    if (r) {
        $("#waitbox").fadeIn();
        $.ajax({
            url: "sr",
            method: "POST",
            data: {
                dirname: dirname,
                model_cho: $("[name='model_cho']").val(),
                gp_cho: gpcho,
                set_cho: setcho
            },
            success: function (data) {
                console.log(data);
                var rescode = data['code'];
                if (rescode === 100) {
                    alert("文件夹名重复");
                } else if (rescode === 1) {
                    new CellObj($("#content"), data['dirname'], data["model"], data['graphs'], data['c_time']);
                    $(".cellobj").hide();
                    $("#cellobj" + data['dirname']).show();
                }

                $("#waitbox").fadeOut();
            },
            error: function () {
                alert("发生错误，请联系维护人员。")
            }
        })
    }
});

function set_content_shape() {
    var foot = $(".main-footer")[0].scrollHeight;
    var head = $(".main-header")[0].scrollHeight;
    var side = $(".main-sidebar")[0].scrollWidth;
    // console.log(foot);
    // console.log(head);
    // console.log($(window)[0].innerHeight - foot - head);
    $(".mycontent").css({
        'height': $(window)[0].innerHeight - foot - head,
        'width': $(window)[0].innerWidth - side,
    })
}

$(document).ready(function () {
    set_content_shape();
})

$("#popbox").click(function () {
    $("#popbox").fadeToggle();
})

$(document).on("click", ".cellimg", function (e) {
    var box = $("#popbox");
    // var img = this.attr('src');
    var img = $(this).attr('src');
    box.html("<img src='%s' style='height: 90%;' class='vcenter'>".replace("%s", img));
    box.fadeToggle();
})

$("#manageobjs").click(function () {
    $(".control-sidebar").html('');
    for (var i = 0, len = cellobjs.length; i < len; i++) {
        var obj = cellobjs[i];
        // console.log(obj);
        var item = $(`
            <div class="objitem">
            <label>文件夹名：</label><a class="dirname">%d</a></br>
            <label>创建时间：</label>%c</br>
            <label>模型：</label>%m
            <button class="delete" index="%i">X</button>
            <button class="single" index="%i">S</button>
            <button class="multiply" index="%i">M</button>
            </br>
            </hr>
            </div>`.replaceAll("%i", i).replace("%m", obj.model).replace("%d", obj.dirname).replace("%c", obj.c_time));
        $(".control-sidebar").append(item);
    }
})

$("#fullscreen").click(function (e) {
    // set_content_shape();
})

$(document).on("click", "button.delete", function (e) {
    console.log(e);
    var index = e.target.getAttribute('index');
    var f = confirm("确认删除当前实例？");
    if (f) {
        $("#cellobj" + cellobjs[index].dirname).remove();
        cellobjs.splice(index, 1);
    }
    console.log("button.delete");
})

$(document).on("click", "button.single", function (e) {
    console.log(e);
    var index = e.target.getAttribute('index');
    var dirname = cellobjs[index].dirname;
    $(".cellobj").hide();
    $(".cellobj").css({"width": "100%"});
    $("#cellobj" + cellobjs[index].dirname).show();
    console.log("button.multiply");
})

$(document).on("click", "button.multiply", function (e) {
    console.log(e);
    var index = e.target.getAttribute('index');
    var dirname = cellobjs[index].dirname;
    $("#cellobj" + cellobjs[index].dirname).show();
    var _list = $(".cellobj");
    var __list = new Array();
    for (var i = 0, len = _list.length; i < len; i++) {
        var it = _list[i];
//         console.log(it.style.display);
        if (!it.style.display) {
            __list.push(it);
        }
    }
    console.log(__list);
    var wid = (100 / __list.length).toString() + "%";
    for (var i = 0, len = __list.length; i < len; i++) {
        var it = __list[i];
        it.style.setProperty("width", wid);
        it.style.setProperty("border", "2px solid red");
    }
    console.log("button.multiply");
})