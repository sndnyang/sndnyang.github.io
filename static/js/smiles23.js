var glviewer = null;
var labels = [];

var addLabels = function () {
    var atoms = glviewer.getModel().selectedAtoms({
        atom: "CA"
    });
    for (var a in atoms) {
        var atom = atoms[a];

        var l = glviewer.addLabel(atom.resn + " " + atom.resi, {
            inFront: true,
            fontSize: 12,
            position: {
                x: atom.x,
                y: atom.y,
                z: atom.z
            }
        });
        atom.label = l;
        labels.push(atom);
    }
};

var colorSS = function (viewer) {
    //color by secondary structure
    var m = viewer.getModel();
    m.setColorByFunction({}, function (atom) {
        if (atom.ss == 'h') return "magenta";
        else if (atom.ss == 's') return "orange";
        else return "white";
    });
    viewer.render();
}

var atomcallback = function (atom, viewer) {
    if (atom.clickLabel === undefined
        || !atom.clickLabel instanceof $3Dmol.Label) {
        atom.clickLabel = viewer.addLabel(atom.elem + atom.serial, {
            fontSize: 14,
            position: {
                x: atom.x,
                y: atom.y,
                z: atom.z
            },
            backgroundColor: "black"
        });
        atom.clicked = true;
    }

    //toggle label style
    else {

        if (atom.clicked) {
            var newstyle = atom.clickLabel.getStyle();
            newstyle.backgroundColor = 0x66ccff;

            viewer.setLabelStyle(atom.clickLabel, newstyle);
            atom.clicked = !atom.clicked;
        }
        else {
            viewer.removeLabel(atom.clickLabel);
            delete atom.clickLabel;
            atom.clicked = false;
        }

    }
};
var readText = function (input, func) {
    if (input.files.length > 0) {
        var file = input.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            func(evt.target.result, file.name);
        };
        reader.readAsText(file);
        $(input).val('');
    }
};

var render2 = function (data, name) {
    glviewer.clear();
    m = glviewer.addModel(data, name);
    glviewer.setStyle({}, { stick: {}, sphere: { scale: 0.25 } });
    glviewer.zoomTo();
    glviewer.render();
}

$(document).ready(function () {

    moldata = data = $("#moldata_pdb_large").val();
    glviewer = $3Dmol.createViewer("gldiv", {
        defaultcolors: $3Dmol.rasmolElementColors
    });
    glviewer.setBackgroundColor(0xffffff);

    receptorModel = m = glviewer.addModel(data, "pqr");

    atoms = m.selectedAtoms({});

    for (var i in atoms) {
        var atom = atoms[i];
        atom.clickable = true;
        atom.callback = atomcallback;
    }

    glviewer.mapAtomProperties($3Dmol.applyPartialCharges);
    glviewer.setStyle({ stick: {}, sphere: { scale: 0.25 } });
    glviewer.zoomTo();
    glviewer.render();

    let input = document.getElementById("mol2d");
    let options = { width: 250, height: 250};

    // Initialize the drawer to draw to canvas
    let smilesDrawer = new SmilesDrawer.Drawer(options);
    SmilesDrawer.parse(input.value, function (tree) {
        smilesDrawer.draw(tree, "mol2dcanvas", "light", false);
    });

    initRDKitModule().then(function (instance) {
        RDKitModule = instance;
        console.log("version: " + RDKitModule.version());
        var mol = RDKitModule.get_mol(input.value);
        var dest = document.getElementById("mol2dcanvas2");
        var svg = mol.get_svg();
        dest.innerHTML = "<div id='drawing' height='500px' width='500px'>" + svg + "</div>";

    });

    input.addEventListener("input", function () {
        // Clean the input (remove unrecognized characters, such as spaces and tabs) and parse it
        SmilesDrawer.parse(input.value, function (tree) {
            // Draw to the canvas
            smilesDrawer.draw(tree, "mol2dcanvas", "light", false);
            // Alternatively, draw to SVG:
            // svgDrawer.draw(tree, 'output-svg', 'dark', false);
        });

        // var smiles = "CCCCCCCCCCCCNC(=O)C(CCCCCOC(=O)CCCCCCC\C=C/CCCCCCCC)NCCN(C)C";
        var mol = RDKitModule.get_mol(input.value);
        var dest = document.getElementById("mol2dcanvas2");
        var svg = mol.get_svg();
        dest.innerHTML = "<div id='drawing' height='500px' width='500px'>" + svg + "</div>";

    });
});