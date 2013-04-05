////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Rename Layers
//  04/05/2013
//  Rory Starks
//
//	Simple script that removes "copy ###" from the end of any visible layers and groups
//
////////////////////////////////////////////////////////////////////////////////////////////////

var layers = app.activeDocument.layers;

RenameLayers(layers);

function RenameLayers(layers) {
	var len =  layers.length;
	var parent = layers.parent;

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