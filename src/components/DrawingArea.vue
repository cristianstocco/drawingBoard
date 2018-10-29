<template>

  <div>
    <div class="controls">
      <div class="tools">
        <div class="primaryTools">
          <Tool name="pencil"/>
          <Tool name="eraser"/>
          <Tool name="text"/>
          <Tool name="line"/>
          <Tool name="rectangle"/>
          <Tool name="ellipse"/>
          <Tool name="polygon"/>
          <Tool name="eyedropper"/>
        </div>

        <div class="actions">
          <Tool name="undo" @click="undo"/>
          <Tool name="redo" @click="redo"/>
          <Tool name="zoomOut" @click="zoomOut"/>
          <Tool name="zoomIn" @click="zoomIn"/>
          <Tool name="export" @click="exportSVG"/>
          <Tool name="trashCan" @click="clear"/>
        </div>

        <div class="secondaryTools">
          <RectangleTool name="colorStroke" @click="colorStroke"/>
          <RectangleTool name="colorFill" @click="colorFill"/>
          <RectangleTool name="colorBackground" @click="colorBackground"/>
          <span class="spacer"/>
          <RectangleTool name="smallSize" @click="smallSize"/>
          <RectangleTool name="mediumSize" @click="mediumSize"/>
          <RectangleTool name="bigSize" @click="bigSize"/>
        </div>

        <Compact v-model="colors" v-show="displayColorPicker" ref="colorPickerContainer" />
      </div>
    </div>

    <div class="literally core" />
  </div>

</template>

<script>
  // === LIBRARIES
  import LC             from './literallycanvas-core.js'
  import Event          from './js/event.js'
  import Tool           from './menu/Tool.vue'
  import RectangleTool  from './menu/RectangleTool.vue'
  import VueColor       from 'vue-color'
  import jQuery         from 'jquery'

  // === GLOBALS
  window.jQuery = window.$ = jQuery

  // === GLOBALS
  var colors = {
    hex: '#194d33',
    hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
    hsv: { h: 150, s: 0.66, v: 0.30, a: 1 },
    rgba: { r: 25, g: 77, b: 51, a: 1 },
    a: 1
  }

  export default {

    components: {
      Tool,
      RectangleTool,
      Compact: VueColor.Compact
    },

    mounted () {
      let imageSize     = { width: false, height: false }
      let $drawBoard    = $( '.literally.core' )
      let $colorPicker  = $( '.vc-compact' )
      //  activating function: functionality and backgroundColor to orange (reseting others')
      let activateTool = (tool) => {
        if( tool.tool ) this.lc.setTool( tool.tool )
        if( tool.name.indexOf('color') == -1 ) {
          this.hideColorPicker()
          this.activeColorPicker = null
          this.activeColorName = null
        }

        this.tools.forEach( (_tool) => {
          if (_tool == tool)                          _tool.el.css( 'backgroundColor', '#fd9f01' )
          else if(_tool.name.indexOf('color') == -1)  _tool.el.css( 'backgroundColor', 'transparent' )
        })
      }
      //  init Literally Canvas
      this.lc = LC.init(
        $drawBoard.get(0),
        {
          backgroundColor: '#eee',
          primaryColor: 'black',
          imageSize: imageSize
        }
      )
      //  menu tools
      this.tools = [
        {
          name: 'tool-pencil',
          el: $('#tool-pencil'),
          tool: new LC.tools.Pencil(this.lc)
        },
        {
          name: 'tool-eraser',
          el: $('#tool-eraser'),
          tool: new LC.tools.Eraser(this.lc)
        },
        {
          name: 'tool-line',
          el: $('#tool-line'),
          tool: new LC.tools.Line(this.lc)
        },
        {
          name: 'tool-polygon',
          el: $('#tool-polygon'),
          tool: new LC.tools.Polygon(this.lc)
        },
        {
          name: 'tool-ellipse',
          el: $('#tool-ellipse'),
          tool: new LC.tools.Ellipse(this.lc)
        },
        {
          name: 'tool-text',
          el: $('#tool-text'),
          tool: new LC.tools.Text(this.lc)
        },
        {
          name: 'tool-rectangle',
          el: $('#tool-rectangle'),
          tool: new LC.tools.Rectangle(this.lc)
        },
        {
          name: 'tool-eyedropper',
          el: $('#tool-eyedropper'),
          tool: new LC.tools.Eyedropper(this.lc)
        },
        {
          name: 'tool-colorStroke',
          el: $('#tool-colorStroke'),
          type: 'primary',
          tool: null
        },
        {
          name: 'tool-colorFill',
          el: $('#tool-colorFill'),
          type: 'secondary',
          tool: null
        },
        {
          name: 'tool-colorBackground',
          el: $('#tool-colorBackground'),
          type: 'background',
          tool: null
        },
        {
          name: 'tool-smallSize',
          el: $('#tool-smallSize'),
          tool: null
        },
        {
          name: 'tool-mediumSize',
          el: $('#tool-mediumSize'),
          tool: null
        },
        {
          name: 'tool-bigSize',
          el: $('#tool-bigSize'),
          tool: null
        }
      ]


      //  set-up UI
      this.tools.forEach( (tool) => {
        tool.el.css( 'cursor', 'pointer' )
        tool.el.click( (e) => {
          e.preventDefault()
          activateTool(tool)
        })
      })
      $drawBoard.css( 'height', $(window).height() )
      activateTool( this.tools[0] )


      //  events
      $colorPicker.click( this.onColorSelect )
    },

    methods: {
      exportSVG( e ) {
        if( e )   e.preventDefault()
        window.console.log( this.lc.getImage() )
        window.console.log( this.lc.getImage().toDataURL() )
      },

      undo() {
        this.lc.undo()
      },

      redo() {
        this.lc.redo()
      },

      zoomIn() {
        this.lc.zoom( 0.1 )
      },

      zoomOut() {
        this.lc.zoom( -0.1 )
      },

      clear() {
        this.lc.clear()
      },

      colorStroke() {
        this.showColorPicker()

        this.tools.forEach( (tool) => {
          if( tool.name.toLowerCase().indexOf('stroke') != -1 ) {
            this.activeColorPicker = tool.name
            this.activeColorName = tool.type
          }
        })
      },

      colorFill() {
        this.showColorPicker()
        
        this.tools.forEach( (tool) => {
          if( tool.name.toLowerCase().indexOf('fill') != -1 ) {
            this.activeColorPicker = tool.name
            this.activeColorName = tool.type
          }
        })
      },

      colorBackground() {
        this.showColorPicker()
        
        this.tools.forEach( (tool) => {
          if( tool.name.toLowerCase().indexOf('background') != -1 ) {
            this.activeColorPicker = tool.name
            this.activeColorName = tool.type
          }
        })
      },

      smallSize() {
        this.lc.tool.strokeWidth = 2
      },

      mediumSize() {
        this.lc.tool.strokeWidth = 5
      },

      bigSize() {
        this.lc.tool.strokeWidth = 10
      },

      showColorPicker() {
        this.displayColorPicker = true
      },

      hideColorPicker() {
        this.displayColorPicker = false
      },

      setColor( colorCode ) {
        $( '#'+this.activeColorPicker ).css( 'backgroundColor', colorCode )
        this.lc.setColor( this.activeColorName, colorCode )
      },

      onColorSelect( e ) {
        setTimeout( () => {
          let pickedColor = $( '.vc-compact-color-item' ).filter( function() {
            return $( this ).find( '.vc-compact-dot' ).css( 'display' ) == 'block'
          }).attr('aria-label')
          let colorCode = pickedColor.substring( pickedColor.indexOf(':')+1 )

          this.setColor( colorCode )
          this.hideColorPicker()
        }, 1)
      },

    },

    data() {
      return {
        lc: null,
        tools: null,
        displayColorPicker: false,
        activeColorPicker: null,
        activeColorName: null,
        colors
      }
    }

  }
</script>

<style scoped>
  @import './literallycanvas-core.css'
</style>
<style>
  .controls {
    border-bottom: 1px solid #222;
    padding-bottom: 10px;
  }
  .spacer {
    padding-left: 20px;
  }
  .tools a {
    display: inline-flex;
    margin-left: 10px;
  }
  .tools a.rectangleTool {
    position: relative;
  }
  .tools .primaryTools, .tools .actions {
    float: left;
  }
  .tools .actions {
    width: 30%;
    padding-left: 50px;
  }
  .tools .secondaryTools {
    clear: both;
  }

  .btn-primary {
    background-color: #1f325c;
    border-color: #1f325c;
    color: #fff;
    font-size: 18px;
  }
  .btn-secondary {
    color: #fff;
    background-color: #ffb200;
    border-color: #ffb200;
    -webkit-transition: all .35s;
    transition: all .35s;
  }
  .btn {
    font-family: Open Sans,Helvetica Neue,Arial,sans-serif;
    border: none;
    border-radius: 300px;
    font-weight: 600;
    text-transform: uppercase;
  }
  #tool-colorStroke {
    background-color: black;
  }
  #tool-colorBackground {
    background-color: #eeeeee;
  }  
</style>
