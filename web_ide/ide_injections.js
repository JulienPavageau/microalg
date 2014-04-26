function onCtrlEnter(elt, f) {
    elt.keydown(function (e) {
        if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey) {
            f(elt);
        }
    });
}

function inject_microalg_editor_in(selector, msg) {
    var script_container = $(selector);
    var script_string = '<textarea id="malg-editor" class="malg-editor" cols="80" style="width:98%;" rows="5" >' + msg + '</textarea>' +
            '<div class="malg-error" style="color: red;"></div>' +
            '<div class="malg-display">&nbsp;</div>';
    script_container.html(script_string);
    var editor = script_container.find('.malg-editor').first();
    // Load local storage in the editor.
    if (typeof(Storage)!=="undefined") {
        if (localStorage.microalg_src) {
            editor.val(localStorage.microalg_src);
        } else {
            editor.val('(Afficher "MicroAlg FTW!")');
        }
    }
    createRichInput(editor);
    editor.focus();
    onCtrlEnter(editor, ide_action);
    function ide_action(editor_elt) {
        var src = editor_elt.val();
        // createRichInput put the editor in a sub div, that's why we use
        // parent().parent()
        var error_elt = editor_elt.parent().parent().find('.malg-error').first();
        var display_elt = editor_elt.parent().parent().find('.malg-display').first();
        display_elt.html('&nbsp;');
        try {
            EMULISP_CORE.eval(src).toString();
            error_elt.text('');
        } catch(e) {
            error_elt.text(e.toString());
        }
        var stdout = EMULISP_CORE.currentState().iSym['*StdOut'].cdr.name;
        if (stdout == '') {
            stdout = '&nbsp;';
        }
        display_elt.html(stdout);
        EMULISP_CORE.currentState().iSym['*StdOut'].cdr.name = '';
        localStorage.microalg_src = src;
    }
}

function inject_microalg_repl_in(selector, msg) {
    var malg_prompt = ": ";
    var repl_container = $(selector);
    var repl_string = '<div class="malg-repl-html-out"></div>' +
        '<textarea id="malg-repl" class="malg-repl" style="width:98%;" rows="5" >' + malg_prompt + msg + '</textarea>' +
        '<p>Besoin d’aide&nbsp;? Taper «&nbsp;(Aide)&nbsp;» puis <code>Ctrl</code>+<code>Entrée</code> pour valider.</p>';
    repl_container.html(repl_string);
    var repl = repl_container.find('.malg-repl').first();
    createRichInput(repl);
    onCtrlEnter(repl, repl_action);
    var old_src = malg_prompt;
    function repl_action(repl_elt) {
        var result = '';
        var repl_content = repl_elt.val();
        var src = repl_content.slice(old_src.length, repl_content.length);
        var html_out = repl_elt.parent().parent().find('.malg-repl-html-out').first();
        try {
            result = EMULISP_CORE.eval(src).toString();
        } catch(e) {
            repl_elt.val(repl_elt.val() + "\n" + e.toString());
        }
        if (result != '' && result != 'NIL') {
            repl_elt.val(repl_elt.val() + "\n-> " + result);
            html_out.html(result);
        }
        var stdout = EMULISP_CORE.currentState().iSym['*StdOut'].cdr.name;
        if (stdout != '' && stdout != 'NIL') {
            repl_elt.val(repl_elt.val() + "\n" + stdout);
        }
        repl_elt.val(repl_elt.val() + "\n" + malg_prompt);
        EMULISP_CORE.currentState().iSym['*StdOut'].cdr.name = '';
        old_src = repl_elt.val();
    }
}
