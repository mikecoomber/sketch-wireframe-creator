import sketch from 'sketch'
// documentation: https://developer.sketchapp.com/reference/api/

export default function(context) {
  console.log('START')
  let sketch = require('sketch')
  
  let document = sketch.getSelectedDocument()
  
  let selectedLayers = document.selectedLayers
  let selectedCount = selectedLayers.length

  if (selectedCount === 0) {
    sketch.UI.message('No layers selected');
  } else {
    findBaseLayer(selectedLayers)

    detatchSymbols(selectedLayers);

    sketch.UI.message('Wireframe created');
  }
}

function findBaseLayer(layers) {
  layers.forEach( function (layer, i) {
    if (layer.type === 'Group' || layer.type === 'Artboard') {
      findBaseLayer(layer.layers);
    } else {
      changeLayerColour(layer) 
    }
  })
} 

function changeLayerColour(layer) {
  if (layer.type === 'ShapePath') {
    let color = layer.style.fills[0].color;
    let newColor = getNewColor(color);
    layer.style.fills = [createFill(newColor)];
    if (layer.name === 'Rectangle') {
      layer.style.borders = [blackOutline()]
    }
  } else if (layer.type === 'Text') {
    let color = layer.style.textColor;
    layer.style.textColor = getNewColor(color);
    
  }
}

function getNewColor(color) {
  let colorInt = parseInt(color.slice(1, color.length - 1), 16)
  return colorInt < 134217727 ? '#000000' : '#ffffff';
}

function detatchSymbols(layers) {
  layers.forEach(function(layer) {
		if (layer.layers) {
			detatchSymbols(layer.layers)
		}
		else {
			if(layer.type == 'SymbolInstance'){
				layer.detach({
					recursively: true
				})
			}
		}
  })
}

function createFill(color) {
  let Style = sketch.Style;
  return {
    color: color,
    fill: Style.FillType.Color
  }
}

function blackOutline() {
  return {
    fillType: 'Color',
    color: '#000000',

  }
}
