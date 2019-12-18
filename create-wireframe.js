import sketch from 'sketch';

const componentFamilies = ['Mobile', 'Icon'];

const componentStyles = new Map();

componentStyles.set('Button', 
  function(layer) {
    layer.style.fills=[createFill('#ffffff')];
    layer.style.borders=[blackOutline()];
  }
)
componentStyles.set('Background', 
  function(layer) {
    layer.style.fills=[createFill('#ffffff')];
  }
)
componentStyles.set('Icon',
  function(layer) {
    if (layer.name !== 'Rectangle') { 
      let color = layer.style.fills[0].color;
      let newColor = getNewColor(color);
      layer.style.fills = [createFill(newColor)];
    }
  }
)

function detatchSymbols(layers) {
  layers.forEach(function(layer) {
		if (layer.layers) {
			detatchSymbols(layer.layers);
		}
		else {
			if(layer.type == 'SymbolInstance'){
				layer.detach({
					recursively: true
				});
			}
    }
  });
}

export default function(context) {
  let sketch = require('sketch');
  
  let document = sketch.getSelectedDocument();
  
  let selectedLayers = document.selectedLayers;
  let selectedCount = selectedLayers.length;

  if (selectedCount === 0) {
    sketch.UI.message('No layers selected');
  } else {
    detatchSymbols(selectedLayers);
    findBaseLayer(selectedLayers);

    sketch.UI.message('Wireframe created');
  }
}

function findBaseLayer(layers, currentComponent) {
  layers.forEach( function (layer, i) {
    if (layer.type === 'Group' || layer.type === 'Artboard') {
      if (stringContainsArrayContents(layer.name, componentFamilies)) {
        currentComponent = getComponentType(layer.name)
      }
      findBaseLayer(layer.layers, currentComponent);
    } else {
      changeLayerStyle(layer, currentComponent);
    }
  })
} 

function changeLayerStyle(layer, currentComponent) {
  if (layer.type === 'Text') {
    let color = layer.style.textColor;
    layer.style.textColor = currentComponent === 'Button' ? '#000000' : getNewColor(color);
  } else if (componentStyles.get(currentComponent)) {
    const setStyle = componentStyles.get(currentComponent);
    setStyle(layer);
  } else if (layer.type === 'ShapePath') {
    let color = layer.style.fills.length > 0 ? layer.style.fills[0].color : '#000000';
    let newColor = getNewColor(color);
    layer.style.fills = [createFill(newColor)];
    if (layer.name === 'Rectangle') {
      layer.style.borders = [blackOutline()];
    }
  } 
}

function getNewColor(color) {
  console.log(color)
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);
  let avg = (r + b + g) / 3
  console.log(avg)
  return avg < 128 ? '#000000' : '#ffffff';
}

function createFill(color) {
  let Style = sketch.Style;
  return {
    color: color,
    fill: Style.FillType.Color
  };
}

function blackOutline() {
  return {
    fillType: 'Color',
    color: '#000000',
  };
}

function stringContainsArrayContents(string, array) {
  let res = false;
  array.forEach(function (item, i) {
    if (string.includes(item)) {
      res = true
    }
  })
  return res
}

function getComponentType(componentName) {
  const start = componentName.indexOf('/') + 2
  let end = start;
  let result = ''
  if (componentName.includes('Mobile')){
    while (componentName[end] !== '/') {
      end++;
    } 
    result = componentName.substring(start, end - 1)
  } else if (componentName.includes('Icon')) {
    result = componentName.substring(0, componentName.indexOf('/') - 1)
  }
  return result
}