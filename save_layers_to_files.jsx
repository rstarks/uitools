////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Save Layers To Files
//  05/13/2013
//  Rory Starks
//
////////////////////////////////////////////////////////////////////////////////////////////////

#target photoshop
 
function main(){
	if(!documents.length) return;
	
	//preference variables
	powerOfTwo = false;
	resize = true;
	fullRes = true;
	trim = true;
	writeCSVs = true;
	writeXML = true;
	writeTextStyles = true;
	
	selectedSize = "normal";
	
	var sizes = {
		'xlarge' 	: 100,
		'large'		: 66,
		'normal'	: 50,
		'small'		: 33
	}
	
	var doc = activeDocument;
	var oldPath = activeDocument.path;

	//prepare text strings that will be used for the output files
	var CSVGraphics = "";
	var CSVText = "";
	var XMLText  = '<layout sourcefile="' + doc.name + '">\n';
	var textStyles = "Text Style information for " + doc.name + "\n==========================================================================\n\n";
    
    //creates the output folder for the exported images
	var outFolder = new Folder(oldPath + "/" + doc.name.substr(0, doc.name.length - 4) + "_png");
	if (!outFolder.exists) { outFolder.create(); }
	
	if (fullRes) {
		var outFolderHD = new Folder(oldPath + "/" + doc.name.substr(0, doc.name.length - 4) + "_png_HD");
		if (!outFolderHD.exists) { outFolderHD.create(); }
	}
	
	//prepare output files
	var CSVGraphicsOutput = File(oldPath + "/" + doc.name.substr(0, doc.name.length - 4) + ".csv");
	var CSVTextOutput = File(oldPath + "/" + doc.name.substr(0, doc.name.length - 4) + "_text.csv");
	var XMLOutput = File(oldPath + "/" + doc.name.substr(0, doc.name.length - 4) + ".xml");
	var textOutput = File(oldPath + "/" + doc.name.substr(0, doc.name.length - 4) + "_text_styles.txt");

	//runs the two main functions of the script
	scanLayerSets(doc);
	scanTextLayers(doc.layers);
 
 	//scans the document looking for layers with .png, .jpg, or .jpeg at the end of the name
	function scanLayerSets(el) {
    	// find layer groups
    	for(var a=0;a<el.layerSets.length;a++){
			var lname = el.layerSets[a].name;
        	if (lname.substr(-4) == ".png" || lname.substr(-4) == ".jpg" || lname.substr(-4) == ".jpeg") {
				saveLayer(el.layers.getByName(lname), lname, oldPath, true, resize);
				if (fullRes) saveLayer(el.layers.getByName(lname), lname, oldPath, true, false); //HD save
				if (writeCSVs || writeXML) writeGraphicsLayer(el.layers.getByName(lname), lname);
        	} else {
            	// recursive
            	scanLayerSets(el.layerSets[a]);
			}
		}
    
 		// find plain layers in current group whose names end with .png
    	for(var j=0; j<el.artLayers.length; j++) {
    		var name = el.artLayers[j].name;
    		if (name.substr(-4) == ".png" || name.substr(-4) == ".jpg" || name.substr(-5) == ".jpeg") {
				saveLayer(el.layers.getByName(name), name, oldPath, false, resize);
				if (fullRes) saveLayer(el.layers.getByName(name), name, oldPath, false, false); //HD save
				if (writeCSVs || writeXML) writeGraphicsLayer(el.layers.getByName(name), name);
			}
		}
	}

	//saves the layer as a JPG or PNG based on the extension of the layer name
	function saveLayer(layer, lname, path, shouldMerge, shouldResize) {
		activeDocument.activeLayer = layer;
		dupLayers();
		if (shouldMerge === undefined || shouldMerge === true) {
			activeDocument.mergeVisibleLayers();
		}
		
		//trims the canvas
		if (trim) {
			activeDocument.trim(TrimType.TRANSPARENT,true,true,true,true);
		}
		
		//resizes the image based on the selected size percentage
		if (shouldResize) {
			modifier = sizes[selectedSize]/100;
			
			sizeX = activeDocument.width.value;
			sizeY = activeDocument.height.value;

			resizeX = Math.floor(sizeX * modifier);
			resizeY = Math.floor(sizeY * modifier);

			activeDocument.resizeImage(resizeX, resizeY, null, ResampleMethod.BICUBIC);
		}
		
		//enlarges the canvas height and width to the next highest powers of two
		if (powerOfTwo) {
			sizeX = activeDocument.width.value;
			sizeY = activeDocument.height.value;
		
			powerOfTwoSizeX = power(sizeX);
			powerOfTwoSizeY = power(sizeY);
		
			activeDocument.resizeCanvas(powerOfTwoSizeX, powerOfTwoSizeY, AnchorPosition.TOPLEFT);
		}
		
		if (fullRes && !shouldResize) { 
			folderSuffix = "_png_HD/";
		} else {
			folderSuffix = "_png/";
		}
		
		var saveFile = File(path + "/" + doc.name.substr(0, doc.name.length - 4) + folderSuffix + lname);
		
		if (lname.substr(-4) == ".png") {
			SavePNG(saveFile);
		} else if (lname.substr(-4) == ".jpg" || lname.substr(-5) == ".jpeg") {
			SaveJPEG(saveFile);
		}			
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	}
	
	//creates coordinate CSVs that can be read by the Flash script
	function writeGraphicsLayer(layer, lname) {
		modifier = sizes[selectedSize]/100;
		
		xPos = Math.floor(layer.bounds[0] * modifier); 
		yPos = Math.floor(layer.bounds[1] * modifier);
		yPosLB = Math.floor(((layer.bounds[3] * -1) + activeDocument.height.value) * modifier);
		width = Math.floor((layer.bounds[2] - layer.bounds[0]) * modifier);
		height = Math.floor((layer.bounds[3] - layer.bounds[1]) * modifier);
		
		//write coordinate CSV file
		if (writeCSVs) {
			/*if (HalfSize == true) {
				xPos = Math.floor(xPos * 0.5);
				yPos = Math.floor(yPos * 0.5);
			}*/
			
	  		if (CSVGraphics == "") {
				CSVGraphics += lname.replace(/\s/g , "-");
			} else {
				CSVGraphics += ";" + lname.replace(/\s/g , "-");
			}
			
			CSVGraphics += ";" + xPos;
			CSVGraphics += ";" + yPos;
		}
		//write XML file
		if (writeXML) {
			XMLText += '   <img filename="' + lname.replace(/\s/g , "-") + '" x="' + xPos + '" y="' + yPosLB + '" width="' + width + '" height="' + height + '" />\n';
		}
	}
	
	//scans all text layers and then writes text style info or CSV data depending on the user preferences
	function scanTextLayers(layers) {
		for(var t=0;t<layers.length;t++){
			if(layers[t].typename == "LayerSet") {
				scanTextLayers(layers[t].layers);
			} else {
				if(layers[t].kind == LayerKind.TEXT) {
					if (writeTextStyles) writeTextLayer(layers[t]);
					if (writeCSVs) writeTextCSV(layers[t]);
				}
			}
		}
	}
	
	//writes the given text layer info to the textStyles variable which will eventually be added to the text style TXT file
	function writeTextLayer(layer) {
		modifier = sizes[selectedSize]/100;
		var name = layer.name;
	  	var contents = layer.textItem.contents;
	
		var leftPos = Math.floor(layer.bounds[0] * modifier);
		var topPos = Math.floor(layer.bounds[1] * modifier);
		var rightPos = Math.floor(layer.bounds[2] * modifier);
		var bottomPos = Math.floor(layer.bounds[3] * modifier);
		var caps = layer.textItem.capitalization=="TextCase.NORMAL"?"normal":"uppercase";
		var font = layer.textItem.font;
		var color = layer.textItem.color.rgb.hexValue?layer.textItem.color.rgb.hexValue:'';
		var size = Math.floor(layer.textItem.size * modifier);
		var align = layer.textItem.justification.toString();

		textStyles += "--------------------------------------------------------------------------\n";
		textStyles += "Layer Name:                " + name + "\n";
		textStyles += "Content:                   " + contents.replace(/\r/gm,' ') + "\n";
		textStyles += "Location (left,top):       " + leftPos + "," + topPos + "\n";
		textStyles += "Location (right,bottom):   " + rightPos + "," + bottomPos + "\n";
		textStyles += "Capitalization Style:      " + caps + "\n";
		textStyles += "Font Name:                 " + font + "\n";
		textStyles += "Color (hex value):         #" + color + "\n";
		textStyles += "Font Size:                 " + size + "px \n";
		textStyles += "Alignment:                 " + align.replace("Justification.","").toLowerCase() + "\n";
		textStyles += "\n\n";
		
	}
	
	//writes a list of information that can be read by the Flash import script
	function writeTextCSV(layer) {
		modifier = sizes[selectedSize]/100;
		var name = layer.name;
	  	var contents = layer.textItem.contents;
	
		var leftPos = Math.floor(layer.bounds[0] * modifier); 
		var topPos = Math.floor(layer.bounds[1] * modifier);
		var rightPos = Math.floor(layer.bounds[2] * modifier);
		var bottomPos = Math.floor(layer.bounds[3] * modifier);
		var caps = layer.textItem.capitalization=="TextCase.NORMAL"?"normal":"uppercase";
		var font = layer.textItem.font;
		var color = layer.textItem.color.rgb.hexValue?layer.textItem.color.rgb.hexValue:'';
		var size = Math.floor(layer.textItem.size * modifier);
		var align = layer.textItem.justification;
	 		
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

	//the following if statements finish up and save out any of the requested data files
	if (writeCSVs) {
		CSVGraphicsOutput.open("w");
		CSVGraphicsOutput.writeln(CSVGraphics);
		CSVGraphicsOutput.close();
		
		CSVTextOutput.open("w");
		CSVTextOutput.writeln(CSVText);
		CSVTextOutput.close();
	}
	
	if (writeXML) {
		XMLText  += "<\layout>";
		XMLOutput.open("w");
		XMLOutput.writeln(XMLText);
		XMLOutput.close();
	}
	
	if (writeTextStyles) {
		textStyles += "==========================================================================\n";
		textOutput.open("w");
		textOutput.writeln(textStyles);
		textOutput.close();
	}
	
	alert("Saving layers to files was successful.");
};
 
main();

function dupLayers() {
	var desc143 = new ActionDescriptor();
	var ref73 = new ActionReference();
	ref73.putClass( charIDToTypeID('Dcmn') );
	desc143.putReference( charIDToTypeID('null'), ref73 );
	desc143.putString( charIDToTypeID('Nm  '), activeDocument.activeLayer.name );
	var ref74 = new ActionReference();
	ref74.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
	desc143.putReference( charIDToTypeID('Usng'), ref74 );
	executeAction( charIDToTypeID('Mk  '), desc143, DialogModes.NO );
};

//export script for PNG files
function SavePNG(saveFile){
	var pngOpts = new ExportOptionsSaveForWeb; 
	pngOpts.format = SaveDocumentType.PNG;
	pngOpts.PNG8 = false; 
	pngOpts.transparency = true; 
	pngOpts.interlaced = false; 
	pngOpts.quality = 100;
	activeDocument.exportDocument(new File(saveFile),ExportType.SAVEFORWEB,pngOpts); 
}

//export script for JPEG files
function SaveJPEG(saveFile){
	var jpegOpts = new ExportOptionsSaveForWeb; 
	jpegOpts.format = SaveDocumentType.JPEG;
	jpegOpts.optimized = true;
	activeDocument.exportDocument(new File(saveFile),ExportType.SAVEFORWEB,jpegOpts); 
}

//function for determining next highest power-of-two value based on a given integer
function power(size) {
	var powerTwo = 2;
	var i = 1;
	while (powerTwo < size) {
		powerTwo = Math.pow(2, i);
		i = i + 1;
	}
	size = powerTwo;
	return(size);   
}

