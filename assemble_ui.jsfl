////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Assemble UI v1.4
//  03/28/2013
//  Rory Starks
//
////////////////////////////////////////////////////////////////////////////////////////////////

// CSV parsing function
String.prototype.splitCSV = function(sep) {
	for (var foo = this.split(sep = sep || ";"), x = foo.length - 1, tl; x >= 0; x--) {
		if (foo[x].replace(/"\s+$/, '"').charAt(foo[x].length - 1) == '"') {
			if ((tl = foo[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
				foo[x] = foo[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
			} else if (x) {
				foo.splice(x - 1, 2, [foo[x - 1], foo[x]].join(sep));
			} else foo = foo.shift().split(sep).concat(foo);
		} else foo[x].replace(/""/g, '"');
	} return foo;
};

//This clears the output panel and prepares the active document for the script to continue.
var doc = fl.getDocumentDOM();
fl.outputPanel.clear();

var fileName = doc.name;
var filePath = doc.path;
filePath = filePath.substring(0, filePath.lastIndexOf(fileName));
fl.trace("Flash file: " + filePath + fileName);

if (fl.getDocumentDOM() == null) {
	fl.trace("Error: No document open.");
	alert("Error: No document open.");
}

var CSVfile = fileName.substr(0, fileName.length - 4) + ".csv";
var CSVTextFile = fileName.substr(0, fileName.length - 4) + "_text.csv";

fl.trace("  CSV file: " + filePath + CSVfile);
fl.trace("\n");
fl.trace(" Text file: " + filePath + CSVTextFile);
fl.trace("\n");

var list = FLfile.read(unescape("file:///" + filePath + CSVfile));
var parsed = list.splitCSV();
var n = parsed.length - 1;

var textList = FLfile.read(unescape("file:///" + filePath + CSVTextFile));
textList = textList.replace(/[\n\r]/g, "");
var textParsed = textList.splitCSV();
var t = textParsed.length - 1;

//This loop goes through the split CSV values backwards and reads every third item as an image and every first and second item as the x and y coordinates.
//The data is used to import and place each item on the stage with the corresponding image from the /<filename>_png/ folder that Photoshop created.
while (n > 0) {
	//importFileToStage("file:///" + filePath + fileName.substr(0, fileName.length - 4) + "_png/" + parsed[n-2] + ".png", parsed[n-2] + ".png", parsed[n-1], parsed[n]);
	importFileToStage("file:///" + filePath + fileName.substr(0, fileName.length - 4) + "_png/" + parsed[n-2] + ".png", parsed[n-2] + ".png", parsed[n-1], parsed[n]);
	//This line displays output from the import process so that you can check x/y coordinates with what appears on the stage.
	fl.trace(parsed[n-2] + ".png placed at " + parsed[n-1] + "," + parsed[n]);
	n = n - 3;
}

//name;contents;leftPos;topPos;rightPos;bottomPos;caps;align;font;color;size;
while (t > 0) {
	var name = textParsed[t-10];				//Name of the layer
	var contents = textParsed[t-9];				//Contents of the text field
	var leftPos = Number(textParsed[t-8]);		//Left pixel position
	var topPos = Number(textParsed[t-7]);		//Top pixel position
	var rightPos = Number(textParsed[t-6]);		//Right pixel position
	var bottomPos = Number(textParsed[t-5]);	//Bottom pixel position
	var caps = textParsed[t-4];					//Capitalization method
	var font = textParsed[t-3];					//Font name
	var color = textParsed[t-2];				//Color value in hex
	var size = Number(textParsed[t-1]);			//Size
	var align = textParsed[t];					//Alignment
	align = align.replace("Justification.","").toLowerCase();
	
	switch(align) {
		case "center":
			topPos = topPos - Math.floor(size * 0.29);
			leftPos = leftPos - Math.floor(size * 0.06);
			rightPos += 4;
			break;
		case "left":
			topPos = topPos - Math.floor(size * 0.29);
			leftPos = leftPos - Math.floor(size * 0.08);
			rightPos += 4;
			break;
		case "right":
			topPos = topPos - Math.floor(size * 0.29);
			leftPos = leftPos - Math.floor(size * 0.1);
			leftPos -= 4;
			rightPos += 6;
			break;
		default:
			topPos = topPos - Math.floor(size * 0.29);
			leftPos = leftPos - Math.floor(size * 0.06);
			rightPos += 4;
	}

	fl.trace(name + ", " + contents + ", " + leftPos + ", " + topPos + ", " + rightPos + ", " + bottomPos + ", " + caps + ", " + font + ", " + color + ", " + size + ", " + align);
	fl.trace("[" + align + "]");
	doc.addNewText({left:leftPos, top:topPos, right:rightPos, bottom:bottomPos});
	doc.setTextString(contents);
	doc.selection[0].textType = "dynamic";
	doc.selection[0].setTextAttr("face", font);
	doc.selection[0].setTextAttr("fillColor", "#" + color);
	doc.selection[0].setTextAttr("size", size);
	doc.selection[0].setTextAttr("alignment", align);
	//doc.setTextString(contents);

	t = t - 11;
}

fl.selectTool("arrow");
doc.selectAll();
doc.distributeToLayers();
doc.selectNone();

// Imports the file directly to the library and skips if the file is already there
/*function importFileToStage(filePath,fileName,importX,importY) {
	//var itemIndex, theItem;
	var stageX = Number(importX);
	var stageY = Number(importY);
	var suffix = fileName.slice(fileName.length - 2, fileName.length);
	fl.trace("suffix = " + suffix);
	fl.trace("fileName = " + fileName + ".png");
	fl.trace("doc.library.findItemIndex = " + doc.library.findItemIndex(fileName));
	
	//if (doc.library.findItemIndex(fileName + ".png") == null) {	
		doc.importFile(filePath, true);
		var itemIndex = doc.library.findItemIndex(fileName);
		var theItem = doc.library.items[itemIndex];
		
	//}
	
	if (suffix == "bg") {
		itemIndex = doc.library.findItemIndex(fileName + "1");
		fl.trace("itemIndex = " + itemIndex);
	} else {
		itemIndex = doc.library.findItemIndex(fileName);
		fl.trace("itemIndex = " + itemIndex);
	}
	
	//theItem = doc.library.items[itemIndex];
	doc.addItem({x:0,y:0},theItem);
	doc.selection[0].x = stageX;
	doc.selection[0].y = stageY;
	createFlashAsset(theItem);
}*/

// This function imports a given file at a given path to the stage and then places it at the included X and Y values.
function importFileToStage(filePath,fileName,importX,importY) {
	//Convert importX and importY to numbers
	var itemIndex, theItem, instanceName;
	var stageX = Number(importX);
	var stageY = Number(importY);
	//fl.trace("Pre item index = " + doc.library.findItemIndex(fileName));
	//Import the file
	if (doc.library.findItemIndex(fileName) == "") {
		doc.importFile(filePath, true);
		itemIndex = doc.library.findItemIndex(fileName);
		theItem = doc.library.items[itemIndex];

		//Add item to the stage
		doc.addItem({x:0,y:0}, theItem);
		doc.selection[0].x = stageX;
		doc.selection[0].y = stageY;
		//Make the item a button or movie clip
		createFlashAsset(theItem);
	} else {
		instanceName = fileName.substr(0, fileName.length - 4);
		//suffix = instanceName.slice(instanceName.length - 2, instanceName.length);
		itemIndex = doc.library.findItemIndex(instanceName);
		theItem = doc.library.items[itemIndex];
		doc.addItem({x:0,y:0}, theItem);
		doc.selection[0].x = stageX;
		doc.selection[0].y = stageY;
	}
}

// Create a movie clip or button based on the naming of the object
function createFlashAsset(item) {
	var assetType;
	mcName = item.name;
	mcName = mcName.substr(0, mcName.lastIndexOf('.'));
	var prefix = mcName.slice(0, 3);
	//var suffix = mcName.slice(mcName.length - 2, mcName.length);
	
	if (prefix == "btn") {
		assetType = "button";
	} else {
		assetType = "movie clip";
	}
	
	if (mcName != null)	{
		newMc = doc.convertToSymbol(assetType, mcName, "top left");
		//fl.getDocumentDOM().selection[0].name = mcName;
		//if (suffix == "bg") newMc.name += "1";
		var lib = doc.library;
		if (lib.getItemProperty('linkageImportForRS') == true) {
			lib.setItemProperty('linkageImportForRS', false);
		}
		lib.setItemProperty('linkageExportForAS', true);
		lib.setItemProperty('linkageExportForRS', false);
		lib.setItemProperty('linkageExportInFirstFrame', true);
		lib.setItemProperty('linkageClassName', mcName);
		lib.setItemProperty('scalingGrid',  false);
	}
}