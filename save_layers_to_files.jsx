////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Save Layers To Files
//  03/28/2013
//  Rory Starks
//
////////////////////////////////////////////////////////////////////////////////////////////////

if (app.documents.length == 0)
	alert( 'Please open a Photoshop document to work with!' );
else
	app.preferences.rulerUnits = Units.PIXELS;
	
	//The follwing variables below can be adjusted manually.
	HalfSize = true; 			//Assuming the source PSD is at HD resolution (double), this flag will generate images at half the size.
	Trim = true;				//Trim the layer after pasting it into a new document that is the same resolution as the source PSD.
	CreateCSV = true;			//Generate a CSV file, which is useful if you are using the AssembleUI.jsfl script in Flash.
	CreateTextCSV = true;		//Generate a CSV file that includes text fields and style information.
	CreateXML = false;			//Generate an XML file with x, y, height, and width information.
	CreateTextStyles = true;	//Creates a text file with descriptive font style information.
	PowerOfTwo = false;			//Each exported image will be in a power-of-two format (legacy support).
	RemoveCopy = true;
	OnSave();
	//DisplayDialog();			//This will be updated later.

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Creates the dialog box that is displayed when starting the script
function DisplayDialog() {
	//dlg = new Window( 'dialog', 'Save Layers to Files', [50,50,500,200] );
	dlg = new Window( 'dialog', 'Save Layers to Files');
	
	//dlg style
	var brush = dlg.graphics.newBrush(dlg.graphics.BrushType.THEME_COLOR, "appDialogBackground");
    dlg.graphics.backgroundColor = brush;
    dlg.graphics.disabledBackgroundColor = brush;

	dlg.orientation = 'column';
	dlg.alignChildren = 'left';

	//dlg content
	dlg.Trim = dlg.add('checkbox', undefined, 'Trim Layers');
	dlg.Trim.value = true;
	
	dlg.MergeGroups = dlg.add('checkbox', undefined, 'Merge Groups');
	dlg.MergeGroups.value = false;
	
	dlg.GenerateHalfRes = dlg.add('checkbox', undefined, 'Generate Half Size');
	dlg.GenerateHalfRes.value = false;
	
	dlg.GenerateXML = dlg.add('checkbox', undefined, 'Generate XML File');
	dlg.GenerateXML.value = false;

	/*dlg.add( "statictext", [30, 35, 100, 60], 'Output Dir :' );
	dlg.OutPutDir = dlg.add( 'edittext', [100, 40, 320, 60], "" );
	dlg.BrowseOutPutDir = dlg.add( 'button', [325, 40, 355, 60], '...' );
	dlg.BrowseOutPutDir.onClick = BrowseOutPutDirectory;*/

	dlg.Cancel = dlg.add( 'button', undefined, 'Cancel' )
	dlg.Cancel.onClick = OnCancel;
	dlg.Ok = dlg.add( 'button', undefined, 'OK' )
	dlg.Ok.onClick = OnSave;

	dlg.cancelElement = dlg.Cancel;
	
	dlg.show();

	return true;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Generates a text file with descriptive style information based on text layers within the Photoshop document
function GenerateTextStylesTXT(file, filename) {
	var layers = app.activeDocument.layers;
	var len =  layers.length;

	var fout = File( file );
	fout.open( "w" );
	
	var TextStyles = "Text Style information for " + filename + "\n";
	TextStyles += "==========================================================================\n\n";
    
	for (var i = 0; i < len; i++) {
		if (layers[i].visible && layers[i].kind == LayerKind.TEXT) {
			var suffix = layers[i].name.slice(4);
			var prefix = layers[i].name.slice(0, 3);
	
			//name;contents;leftPos;topPos;rightPos;bottomPos;caps;font;color;size;
			var name = layers[i].name;
	  		var contents = layers[i].textItem.contents;
	
			var leftPos = layers[i].bounds[0]; 
			var topPos = layers[i].bounds[1];
			var rightPos = layers[i].bounds[2];
			var bottomPos = layers[i].bounds[3];
			var caps = layers[i].textItem.capitalization=="TextCase.NORMAL"?"normal":"uppercase";
			var font = layers[i].textItem.font;
			var color = layers[i].textItem.color.rgb.hexValue?layers[i].textItem.color.rgb.hexValue:'';
			var size = layers[i].textItem.size;
			var align = layers[i].textItem.justification.toString();
			//align = align.replace("Justification.","").toLowerCase();
			
			if (HalfSize == true) {
				leftPos = Math.floor(leftPos * 0.5);
				topPos = Math.floor(topPos * 0.5);
				rightPos = Math.floor(rightPos * 0.5);
				bottomPos = Math.floor(bottomPos * 0.5);
				size = Math.floor(size * 0.5);
			}

			TextStyles += "--------------------------------------------------------------------------\n";
			TextStyles += "Layer Name:                " + name + "\n";
			TextStyles += "Content:                   " + contents.replace(/\r/gm,' ') + "\n";
			TextStyles += "Location (left,top):       " + leftPos + "," + topPos + "\n";
			TextStyles += "Location (right,bottom):   " + rightPos + "," + bottomPos + "\n";
			TextStyles += "Capitalization Style:      " + caps + "\n";
			TextStyles += "Font Name:                 " + font + "\n";
			TextStyles += "Color (hex value):         #" + color + "\n";
			TextStyles += "Font Size:                 " + size + "\n";
			TextStyles += "Alignment:                 " + align.replace("Justification.","").toLowerCase() + "\n";
			TextStyles += "\n\n";
		}
	}
	TextStyles += "==========================================================================\n";
	fout.writeln(TextStyles);
	fout.close();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Generates a CSV based on text layers within the Photoshop document
function GenerateTextCSV(file) {
	//var activeDoc = app.activeDocument;
	var layers = app.activeDocument.layers;
	var len =  layers.length;

	var fout = File( file );
	fout.open( "w" );
	
	var CSVText = "";
    
	for (var i = 0; i < len; i++) {
		if (layers[i].visible && layers[i].kind == LayerKind.TEXT) {
			var suffix = layers[i].name.slice(4);
			var prefix = layers[i].name.slice(0, 3);
	
			//name;contents;leftPos;topPos;rightPos;bottomPos;caps;font;color;size;
			var name = layers[i].name;
	  		var contents = layers[i].textItem.contents;
	
			var leftPos = layers[i].bounds[0]; 
			var topPos = layers[i].bounds[1];
			var rightPos = layers[i].bounds[2];
			var bottomPos = layers[i].bounds[3];
			var caps = layers[i].textItem.capitalization=="TextCase.NORMAL"?"normal":"uppercase";
			var font = layers[i].textItem.font;
			var color = layers[i].textItem.color.rgb.hexValue?layers[i].textItem.color.rgb.hexValue:'';
			var size = layers[i].textItem.size;
			var align = layers[i].textItem.justification;
			
			if (HalfSize == true) {
				leftPos = Math.floor(leftPos * 0.5);
				topPos = Math.floor(topPos * 0.5);
				rightPos = Math.floor(rightPos * 0.5);
				bottomPos = Math.floor(bottomPos * 0.5);
				size = Math.floor(size * 0.5);
			}
	  		
	  		if (CSVText == "") {
				CSVText += name;
			} else {
				CSVText += ";" + name;
			}
			
			CSVText += ";" + contents;
			CSVText += ";" + leftPos;
			CSVText += ";" + topPos;
			CSVText += ";" + rightPos;
			CSVText += ";" + bottomPos;
			CSVText += ";" + caps;
			CSVText += ";" + font;
			CSVText += ";" + color;
			CSVText += ";" + size;
			CSVText += ";" + align;
		}
	}
	fout.writeln(CSVText);
	fout.close();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Generates a CSV based on visible layers within the Photoshop document
function GenerateCoordinatesCSV(file) {
	//var activeDoc = app.activeDocument;
	var layers = app.activeDocument.layers;
	var len =  layers.length;

	var fout = File( file );
	fout.open( "w" );
	
	var CSVText = "";
    
	for (var i = 0; i < len; i++) {
		if (layers[i].visible && layers[i].kind != LayerKind.TEXT) {
			var suffix = layers[i].name.slice(4);
			var prefix = layers[i].name.slice(0, 3);
	
			var xPos = layers[i].bounds[0]; 
			var yPos = layers[i].bounds[1];
			
			if (HalfSize == true) {
				xPos = Math.floor(xPos * 0.5);
				yPos = Math.floor(yPos * 0.5);
			}

	  		var filePath = layers[i].name;
	  		if (CSVText == "") {
				CSVText += filePath;
			} else {
				CSVText += ";" + filePath;
			}
			CSVText += ";" + xPos;
			CSVText += ";" + yPos;
			//CSVText += "\n";
		}
	}
	fout.writeln(CSVText);
	fout.close();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Generates an XML based on visible layers within the Photoshop document
function GenerateXMLFile(file) {
	//var activeDoc = app.activeDocument;
	var layers = app.activeDocument.layers;
	var len =  layers.length;

	var fout = File( file );
	fout.open( "w" );

	var XMLText  = "<ObjectsList>\n";
    //var backgroundText = "This Script Trim each Layers and export as separate PNG images with X Y Coordnates (Center)";

	for (var i = 0; i < len; i++) {
	/*for(i = len-1; i >= 0; i--) {*/

		if (layers[i].visible) {
			var suffix = layers[i].name.slice(4);
			var prefix = layers[i].name.slice(0, 3);
		
			/*
			//Center Position
			var xPos = (layers[i].bounds[0] + layers[i].bounds[2])/2; 
			var yPos = (layers[i].bounds[1] + layers[i].bounds[3])/2; 
			var width = layers[i].bounds[2] - layers[i].bounds[0];
			var height = layers[i].bounds[3] - layers[i].bounds[1];
			*/	
		
			//Left Top Position
			var xPos = (layers[i].bounds[0]); 
			var yPos = (layers[i].bounds[1]);
			var width = layers[i].bounds[2] - layers[i].bounds[0];
			var height = layers[i].bounds[3] - layers[i].bounds[1];


	  		 // Background Layers
			if (prefix != "XXN") {
   				//XMLText += "filename";
				var filePath = layers[i].name;
				XMLText += filePath+",";
				//XMLText += "x=";
				XMLText += Format(xPos)+",";
				//XMLText += "y=";
				XMLText += Format(yPos)+",";
				//XMLText += "w=";
				XMLText += Format(width)+",";
				//XMLText += "h=";
				XMLText += Format(height);
				XMLText += "\n";
			}
		}
	}

	XMLText  += "<\ObjectsList>";

	//fout.writeln(backgroundText);
	fout.writeln(XMLText);
	fout.close();
	//alert(file);
}


function Format(yendo) {
	var text = "";
	text += yendo;
	var index = text.indexOf( " ", 0 );
	return text.substring(0, index);
}


function BrowseOutPutDirectory() {
	var heading = "Please select a directory";
	dlg.OutPutDir.text = Folder ( Folder.selectDialog( heading, dlg.OutPutDir.text )).fsName; 
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Removes "copy ###" from the end of a layer name
function RenameLayers(layers) {
	var len =  layers.length;
	var parent = layers.parent;
	//Recursively goes through the document looking for "copy ###" and removes it on all visible layers
	for (var i = 0;i < len; i++){
		var layer = layers[i];
		if(layer.typename != 'LayerSet' && layer.visible) {
			var oldName = layer.name;
			var newName = oldName.replace(/\scopy.*$/i,'');
			layer.name = newName;
		} else if (layer.typename == 'LayerSet' && layer.visible) {
			RenameLayers(layer.layers);
		} else {
			continue;
		}
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Closes the dialog
function OnCancel() {
	dlg.close()
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Main function that generates XML and starts the layer export process
function OnSave() {
	fileNameEXT = app.activeDocument.name;
	fileName = fileNameEXT.substr(0, fileNameEXT.length - 4);
	filePath = app.activeDocument.path + "/" + fileName + ".xml";
	filePathCSV = app.activeDocument.path + "/" + fileName + ".csv";
	filePathTextCSV = app.activeDocument.path + "/" + fileName + "_text.csv";
	filePathTextStyles = app.activeDocument.path + "/" + fileName + "_text_styles.txt";
	//filePath += dlg.OutPutFileName.text;
	
	app.activeDocument.selection.deselect();
	
	if (RemoveCopy) RenameLayers(app.activeDocument.layers);
	
	app.activeDocument.save();
	MergeLayers(app.activeDocument.layers);

	if (CreateXML) GenerateXMLFile(filePath);
	if (CreateCSV) GenerateCoordinatesCSV(filePathCSV);
	if (CreateTextCSV) GenerateTextCSV(filePathTextCSV);
	if (CreateTextStyles) GenerateTextStylesTXT(filePathTextStyles, fileNameEXT);
	//dlg.close();
	
	layers = app.activeDocument.layers;
	
	var pngFolder = new Folder(app.activeDocument.path + "/" + fileName + "_png");
	var pngFolderHD = new Folder(app.activeDocument.path + "/" + fileName + "_png_HD");
	if (!pngFolder.exists && HalfSize) pngFolder.create();
	if (!pngFolderHD.exists) pngFolderHD.create();
	
	for(i = 0; i < app.activeDocument.layers.length; i++) {
		if (app.activeDocument.layers[i].visible && app.activeDocument.layers[i].kind != LayerKind.TEXT) {
			//SaveLayer(app.activeDocument.layers[i], dlg.OutPutDir.text );
			if (HalfSize) SaveLayer(app.activeDocument.layers[i], app.activeDocument.path + "/" + fileName + "_png", true);
			SaveLayer(app.activeDocument.layers[i], app.activeDocument.path + "/" + fileName + "_png_HD", false);	
		}
	}
	//alert("files saved");
	//dlg.close();
	executeAction(app.charIDToTypeID("Rvrt"), new ActionDescriptor(), DialogModes.NO);
	app.activeDocument.save();
	alert("Saving layers to files was successful.");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Flattens layers in the document so that they are prepped for export
function MergeLayers(layers){
    var len = layers.length;
    var parent = layers.parent;
    var newLayer;
    for(var i = 0; i < len; i++){
        var layer = layers[i];
        if(layer.isBackgroundLayer){
            continue;
        }
		//layer.allLocked = false;
        if(layer.typename == 'ArtLayer' && layer.visible && layer.kind != LayerKind.TEXT) {
            newLayer = parent.artLayers.add();
            newLayer.name = layer.name; //PRO MOVES
            newLayer.move(layer, ElementPlacement.PLACEAFTER);
            layer.merge();
        }
    	else if(layer.typename == 'LayerSet' && layer.visible && layer.kind != LayerKind.TEXT){
        	layer.merge();
        	/*if (MergeGroups.value) {
        		layer.merge();
        	} else {
        		//MergeLayers(layer.layers);
			}*/
		} else {
			continue;
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Takes the active layer and saves it within the <filename>_png or <filename>_png_HD directory
function SaveLayer(saveLayer, path, half) {
	//This script duplicates the layer from the source document and places it into a new document so that it can be saved
	var sourceDoc = app.activeDocument;

	//Create a new document with the same height, width, and resolution as the source document
	var targetDoc = app.documents.add(sourceDoc.width, sourceDoc.height, sourceDoc.resolution, "temp", NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);
	//Switch focus to the source document
	app.activeDocument = sourceDoc;

	//Duplicate the layer from the source document to the target document
	try {
  		saveLayer.duplicate(targetDoc, ElementPlacement.INSIDE); // ** changed to sourceDoc **
	} catch(e) {
  		alert(e)
	}
	//Switch back to the target document
	app.activeDocument = targetDoc;
	
	//TO DO
	//TRIM THE DOCUMENT IF THE TRIM CHECKBOX WAS CHECKED
	if (Trim == true) {
		app.activeDocument.trim(TrimType.TRANSPARENT);
	}
	
	//Resize the exported images prior to saving
	if (half) {
		sizeX = app.activeDocument.width.value;
		sizeY = app.activeDocument.height.value;

		newSizeX = Math.floor(sizeX * 0.5);
		newSizeY = Math.floor(sizeY * 0.5);

		app.activeDocument.resizeImage(newSizeX, newSizeY, null, ResampleMethod.BICUBIC);
	}
	
	//Expand the canvas to the next highest powers of two
	if (PowerOfTwo) {
		sizeX = app.activeDocument.width.value;
		sizeY = app.activeDocument.height.value;
		
		powerOfTwoSizeX = power(sizeX);
		powerOfTwoSizeY = power(sizeY);
		
		doc.resizeCanvas(powerOfTwoSizeX, powerOfTwoSizeY, AnchorPosition.TOPLEFT);
	}
	
	//Export a PNG of the target document using "Save for Web..." and then delete the target document
	saveForWebPNG(path,saveLayer.name);
	targetDoc.close( SaveOptions.DONOTSAVECHANGES ); 
	targetDoc = null;
	
	app.activeDocument = sourceDoc;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function replicates the "Save for Web..." feature of Photoshop
function saveForWebPNG(path, filename) {
    var opts, file;
    opts = new ExportOptionsSaveForWeb();
    opts.format = SaveDocumentType.PNG;
    opts.PNG8 = false;
    opts.quality = 100;
    if (filename.length > 27) {
        file = new File(path + "/temp.png");
        app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, opts);
        file.rename(filename + ".png");
    }
    else {
        file = new File(path + "/" + filename + ".png");
        app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, opts);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function will get the next highest power of two number for a given number
function power(Size) {
	var powerTwo = 2;
	var i = 1;
	while (powerTwo < Size) {
		powerTwo = Math.pow(2, i);
		i= i+1;
	}
	Size = powerTwo;
	return(Size);   
}
