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
          <Tool name="pan"/>
        </div>

        <div class="actions">
          <Tool name="undo" @click="undo"/>
          <Tool name="redo" @click="redo"/>
          <Tool name="zoomOut" @click="zoomOut"/>
          <Tool name="zoomIn" @click="zoomIn"/>
          <Tool name="export" @click="onExport"/>
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
  import LC             from './js/literallycanvas-core.js'
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
      let drawingBoardHeight  = $(window).height() - $('.controls').height()
      let imageSize           = { width: null, height: null }
      let $drawingBoard       = $('.literally.core')
      let $colorPicker        = $('.vc-compact')

      //  drawing board ui
      $drawingBoard.css('height', drawingBoardHeight)

      //  init Literally Canvas
      this.lc = LC.init(
        $drawingBoard.get(0),
        {
          backgroundColor: '#eee',
          primaryColor: 'black',
          imageSize: imageSize,
          keyboardShortcuts: false
        }
      )

      //  menu tools
      this.tools = [
        {
          name: 'tool-pencil',
          el: $('#tool-pencil'),
          lcTool: new LC.tools.Pencil(this.lc)
        },
        {
          name: 'tool-eraser',
          el: $('#tool-eraser'),
          lcTool: new LC.tools.Eraser(this.lc)
        },
        {
          name: 'tool-line',
          el: $('#tool-line'),
          lcTool: new LC.tools.Line(this.lc)
        },
        {
          name: 'tool-polygon',
          el: $('#tool-polygon'),
          lcTool: new LC.tools.Polygon(this.lc)
        },
        {
          name: 'tool-ellipse',
          el: $('#tool-ellipse'),
          lcTool: new LC.tools.Ellipse(this.lc)
        },
        {
          name: 'tool-text',
          el: $('#tool-text'),
          lcTool: new LC.tools.Text(this.lc)
        },
        {
          name: 'tool-rectangle',
          el: $('#tool-rectangle'),
          lcTool: new LC.tools.Rectangle(this.lc)
        },
        {
          name: 'tool-eyedropper',
          el: $('#tool-eyedropper'),
          lcTool: new LC.tools.Eyedropper(this.lc)
        },
        {
          name: 'tool-pan',
          el: $('#tool-pan'),
          lcTool: new LC.tools.Pan(this.lc)
        },
        {
          name: 'tool-colorStroke',
          el: $('#tool-colorStroke'),
          type: 'primary',
          lcTool: null
        },
        {
          name: 'tool-colorFill',
          el: $('#tool-colorFill'),
          type: 'secondary',
          lcTool: null
        },
        {
          name: 'tool-colorBackground',
          el: $('#tool-colorBackground'),
          type: 'background',
          lcTool: null
        },
        {
          name: 'tool-smallSize',
          el: $('#tool-smallSize'),
          lcTool: null
        },
        {
          name: 'tool-mediumSize',
          el: $('#tool-mediumSize'),
          lcTool: null
        },
        {
          name: 'tool-bigSize',
          el: $('#tool-bigSize'),
          lcTool: null
        }
      ]

      //  set-up UI
      this.tools.forEach( (tool) => {
        this.setPointerCursor( tool.el )

        tool.el.click( (e) => {
          e.preventDefault()
          this.activateTool(tool)
        })
      })
      this.activateTool( this.tools[0] )

      //  events
      $colorPicker.click( this.onColorSelect )
    },

    methods: {
      //  activating function: functionality and backgroundColor to orange (reseting others')
      activateTool(tool) {
        let isColorTool = tool.name.indexOf('color') > -1

        if( tool.lcTool ) this.lc.setTool( tool.lcTool )

        if( !isColorTool ) {
          this.hideColorPicker()
          this.activeColorName = null
          this.activeColorType = null
        }

        this.tools.forEach( (_tool) => {
          if (_tool == tool)      _tool.el.css( 'backgroundColor', '#fd9f01' )
          else if(!isColorTool)   _tool.el.css( 'backgroundColor', 'transparent' )
        })
      },

      //  triggers "trigger" function on a click outside of a "container"
      //  if "containerNotTriggering" is clicked the "trigger" callback is not executed
      outsideClick(trigger, container, containerNotTriggering) {
        const onClick = (ev) => {
          const safetyLimit = 1000
          let parentContainer = ev.target
          let i = 0
          let skipTrigger = false

          while (parentContainer !== document.body && parentContainer !== null) {
            if(
                    containerNotTriggering.indexOf( parentContainer.getAttribute('id') ) != -1
                ||  containerNotTriggering.indexOf( parentContainer.getAttribute('class') ) != -1
              ) {
              skipTrigger = true
              return
            }

            if (parentContainer === container) {
              return
            }

            parentContainer = parentContainer.parentNode

            i++
            if (i > safetyLimit) {
              console.log('Infinite loop @ event.outsideClick')
              return
            }
          }

          if( !skipTrigger )
            trigger(ev)

          window.removeEventListener('click', onClick)
        }

        window.addEventListener('click', onClick)
      },

      //  drawingBoard: triggers when click on export
      onExport() {
        this.setExportSettings()
        this.lc.on( 'shapeSave', this.exportSVG )
      },

      //  drawingBoard: triggers when click on export
      setExportSettings() {
        this.setCrosshairCursor()
        this.smallSize()
        this.lc.setColor( 'primary', '#ccc' )
        this.lc.setColor( 'secondary', 'transparent' )
        this.lc.setTool( new LC.tools.Rectangle(this.lc) )
      },

      //  drawingBoard: exports the SVG
      exportSVG( border ) {
        const options = ['shapes', 'imageSize', 'colors', 'position', 'scale', 'backgroundShapes']
        let _rect = {
          x:      border.shape.x,
          y:      border.shape.y,
          width:  border.shape.width,
          height: border.shape.height,
        }
        let _margin = {
          top:    2,
          right:  2,
          bottom: 2,
          left:   2
        }

        let img = LC.renderSnapshotToImage(this.lc.getSnapshot(options), {rect: _rect, margin: _margin})
        window.console.log( img.toDataURL() )

        this.lc.undo()
        this.setPointerCursor()
      },

      //  drawingBoard: undo last action
      undo() {
        this.lc.undo()
      },

      //  drawingBoard: redo last action
      redo() {
        this.lc.redo()
      },

      //  drawingBoard: zoom in
      zoomIn() {
        this.lc.zoom( 0.1 )
      },

      //  drawingBoard: zoom out
      zoomOut() {
        this.lc.zoom( -0.1 )
      },

      //  drawingBoard: clears the board
      clear() {
        this.lc.clear()
      },

      //  drawingBoard: sets up the stroke color
      colorStroke() {
        this.setActiveColor( 'stroke' )
        this.showColorPicker()
      },

      //  drawingBoard: sets up the fill color
      colorFill() {
        this.setActiveColor( 'fill' )
        this.showColorPicker()
      },

      //  drawingBoard: sets up the background color
      colorBackground() {
        this.setActiveColor( 'background' )
        this.showColorPicker()
      },

      //  drawingBoard: sets up the status for the next color choice
      setActiveColor( filter ) {
        this.tools.forEach( (tool) => {
          if( tool.name.toLowerCase().indexOf( filter ) != -1 ) {
            this.activeColorName = tool.name
            this.activeColorType = tool.type
          }
        })
      },

      //  drawingBoard: small stroke
      smallSize() {
        this.lc.tool.strokeWidth = 2
      },

      //  drawingBoard: medium stroke
      mediumSize() {
        this.lc.tool.strokeWidth = 5
      },

      //  drawingBoard: big stroke
      bigSize() {
        this.lc.tool.strokeWidth = 10
      },

      //  drawingBoard: shows the color picker pop-up
      showColorPicker() {
        this.displayColorPicker = true

        //  setTimeout for trigger at the next input click
        setTimeout( () => {
          this.outsideClick(
            () => {this.onColorSelect( null )},
            $( '.vc-compact-colors' ),
            this.getToolNames( 'color' )
          )
        }, 1 )
      },

      //  drawingBoard: hides the color picker pop-up
      hideColorPicker() {
        this.displayColorPicker = false
      },

      //  drawingBoard: sets up the color of tool using the status
      setColor( colorCode ) {
        $( '#'+this.activeColorName ).css( 'backgroundColor', colorCode )
        this.lc.setColor( this.activeColorType, colorCode )
      },

      //  drawingBoard: triggers when clicked on a color square
      onColorSelect( e ) {
        //  setTimeout to wait the click event on the color element
        setTimeout( () => {
          let pickedColor = $( '.vc-compact-color-item' ).filter( function() {
            return $( this ).find( '.vc-compact-dot' ).css( 'display' ) == 'block'
          }).attr('aria-label')
          let colorCode = pickedColor.substring( pickedColor.indexOf(':')+1 )

          this.setColor( colorCode )
          this.hideColorPicker()
        }, 1)
      },

      //  drawingBoard: returns a stack with filtered tool names
      getToolNames( filter ) {
        let stack = []

        this.tools.forEach( (tool) => {
          if( tool.name.toLowerCase().indexOf( filter ) != -1 )
            stack.push( tool.name )
        })

        return stack
      },

      //  ui: set cursor type
      setCrosshairCursor( $element ) {
        $element = $element ? $element : $('body')

        $element.css('cursor', 'crosshair')
      },

      //  ui: set cursor type
      setPointerCursor( $element ) {
        $element = $element ? $element : $('body')

        $element.css('cursor', 'pointer')
      }

    },

    data() {
      return {
        lc: null,
        tools: null,
        displayColorPicker: false,
        activeColorName: null,
        activeColorType: null,
        colors
      }
    }

  }
</script>

<style scoped>
  @import './css/literallycanvas-core.css'
</style>
<style>
  .tools {
    border-bottom: 1px solid #222;
    padding-bottom: 10px;
  }
  .controls {
    padding-top: 5px;
  }
  .spacer {
    padding-left: 34px;
  }
  .secondaryTools a {
    display: inline-flex;
  }
  .tools a {
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
    padding-top: 5px;
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
  .primaryTools a:hover, .secondaryTools a:hover {
    background-color: lightgray !important;
  }
</style>
