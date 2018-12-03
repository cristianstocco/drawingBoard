<template>

  <div :id="name">
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
          <!-- <Tool name="eyedropper"/> -->
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
          <BorderedTool name="colorStroke" @click="color('stroke')"/>
          <BorderedTool name="colorFill" @click="color('fill')"/>
          <span class="spacer"/>
          <BorderedTool name="smallSize" @click="smallSize"/>
          <BorderedTool name="mediumSize" @click="mediumSize"/>
          <BorderedTool name="bigSize" @click="bigSize"/>
          <span class="spacer"/>
          <span v-show="displayLineSettings">
            <BorderedTool name="dashLine" @click="dashLine"/>
            <BorderedTool name="arrowLine" @click="arrowLine"/>
          </span>
        </div>
        <div class="labels">
          <span class="stroke">stroke</span>
          <span class="fill">fill</span>
        </div>

        <div id='strokePicker' v-show="displayStrokePicker" @click="setColor('stroke')">
          <Compact v-model="colors"/>
        </div>
        <div id='fillPicker' v-show="displayFillPicker" @click="setColor('fill')">
          <Compact v-model="colors"/>
        </div>
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
  import BorderedTool   from './menu/BorderedTool.vue'
  import VueColor       from 'vue-color'
  import jQuery         from 'jquery'

  // === GLOBALS
  // window.jQuery = window.$ = jQuery

  // === LOCALS
  var colors = {
    hex: '#194d33',
    hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
    hsv: { h: 150, s: 0.66, v: 0.30, a: 1 },
    rgba: { r: 25, g: 77, b: 51, a: 1 },
    a: 1
  }

  export default {

    props: ['name'],

    components: {
      Tool,
      BorderedTool,
      Compact: VueColor.Compact
    },

    mounted () {
      let $drawingArea        = $('#' + this.name)
      let self            = this
      let drawingBoardHeight  = $(window).height() - $('.controls').height() - $('.tabs').height()
      let imageSize           = { width: null, height: null }
      this.$sizeTools         = $drawingArea.find('a[id*="Size"]')
      this.$drawingBoard      = $drawingArea.find('.literally.core')

      // window.console.log( "HEYYY how many drawingBoard?: " + $drawingBoard.length )
      // window.console.log( this.name )
      // setTimeout(()=>{
      //   window.console.log( $('#' + this.name).length )
      // }, 1000)

      //  drawing board ui
      this.$drawingBoard.css('height', drawingBoardHeight)

      //  init Literally Canvas
      this.lc = LC.init(
        this.$drawingBoard.get(0),
        {
          backgroundColor: '#eee',
          primaryColor: this.primaryColor,
          imageSize: imageSize,
          keyboardShortcuts: false
        }
      )
      this.lc.on( 'toolChange', this.onToolChange )

      //  menu tools
      this.tools = [
        {
          name: 'tool-pencil',
          el: $('#tool-pencil'),
          lcTool: new LC.tools.Pencil(this.lc),
          dotDisplay: true
        },
        {
          name: 'tool-eraser',
          el: $('#tool-eraser'),
          lcTool: new LC.tools.Eraser(this.lc)
        },
        {
          name: 'tool-line',
          el: $('#tool-line'),
          lcTool: new LC.tools.Line(this.lc),
          dotDisplay: true
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
        /* {
          name: 'tool-eyedropper',
          el: $('#tool-eyedropper'),
          lcTool: new LC.tools.Eyedropper(this.lc)
        }, */
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
        }
      ]

      //  color map
      this.colorMap = {
        'stroke': {
          el: $('#tool-colorStroke'),
          toggleStatus: function() {
            self.resetPickers()
            self.displayStrokePicker = true

            self.outsideClick( self.resetPickers, this.el.get(0) )
          },
        },
        'fill': {
          el: $('#tool-colorFill'),
          toggleStatus: function() {
            self.resetPickers()
            self.displayFillPicker = true

            self.outsideClick( self.resetPickers, this.el.get(0) )
          },
        },
      },

      //  set-up size tool activation
      this.$sizeTools.click( function(e) {
        e.preventDefault()
        self.activateSizeStroke($(this))
      })

      //  set-up general tool activation
      this.tools.forEach(tool => {
        tool.el.click(e => {
          e.preventDefault()
          this.activateTool(tool)
        })
      })
      this.activatePreviousTool()

      //  set-up default color for stroke
      this.colorMap[ 'stroke' ].el.data( 'backgroundColor', '#000000' )
    },

    methods: {
      //  drawingBoard: activates previous tool
      activatePreviousTool() {
        let tool = this.getTool( this.activeToolName )
        let defaultTool = this.tools[0]

        if( tool )  this.activateTool( tool )
        else        this.activateTool( defaultTool )
      },

      //  drawingBoard: activates tool functionality and backgroundColor to orange (reseting others')
      activateTool(tool) {
        let isColorTool = tool.el.attr('id').toLowerCase().indexOf('color') != -1;
        
        if( tool.lcTool ) this.lc.setTool( tool.lcTool )

        if( tool.name.toLowerCase().indexOf('line') == -1 ) this.hideLineSettings()
        else                                                this.showLineSettings()

        this.toActivateSize()

        this.tools.forEach( (_tool) => {
          if( _tool == tool && !isColorTool ) _tool.el.addClass( 'selected' )
          else                                _tool.el.removeClass( 'selected' )
        })
      },

      //  drawingBoard: deferences tools
      deactivateTools() {
        this.tools.forEach( (tool) => {
          tool.el.removeClass( 'selected' )
        })
      },

      //  drawingBoard: activates size stroke status for drawing
      activateSizeStroke($tool) {
        this.$sizeTools.removeClass( 'selected' )
        $tool.addClass( 'selected' )
      },

      //  triggers "trigger" function on a click outside of a "container"
      outsideClick(trigger, container) {
        const onClick = (ev) => {
          const safetyLimit = 1000
          let parentContainer = ev.target
          let i = 0
          let skipTrigger = false

          while (parentContainer !== document.body && parentContainer !== null) {
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

          trigger(ev)

          window.removeEventListener('click', onClick)
        }

        window.addEventListener('click', onClick)
      },

      //  drawingBoard: saving current tool state
      onToolChange( tool ) {
        if( !this.onExporting )
          this.activeToolName = tool.tool.name.toLowerCase()
      },

      //  drawingBoard: triggers when click on export
      onExport() {
        let self = this

        this.saveToolSettings()
        this.exportSettings()
        this.setCrossPointer()
        this.exportCallback = this.lc.on( 'shapeSave', this.exportSVG )
      },

      //  drawingBoard: settings for export
      exportSettings() {
        this.onExporting = true

        this.smallSize()
        this.lc.setColor( 'primary', '#ccc' )
        this.lc.setColor( 'secondary', 'transparent' )
        this.lc.setTool( new LC.tools.Rectangle(this.lc) )
      },

      //  drawingBoard: triggers when click on export
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

        this.lc.shapes.pop()
        setTimeout( () => {
          try{
            this.lc.undo()
          } catch( error ) {}
        }, 1 )
        setTimeout( () => {
          try{
            this.lc.undo()
          } catch( error ) {}
        }, 2 )
        setTimeout( () => {
          try{
            this.lc.redo()
          } catch( error ) {}
        }, 3 )
        // this.lc.clearSnapshotBorder()

        this.activatePreviousTool()
        // this.resetToolSettings()
        this.exportCallback()

        this.onExporting = false
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
      color( type ) {
        this.colorMap[ type ].toggleStatus()
        this.setPickerColor( type )
      },

      //  drawingBoard: saving tool settings
      saveToolSettings() {
        this.primaryColor = this.lc.getColor('primary')
        this.secondaryColor = this.lc.getColor('secondary')
        this.strokeWidth = this.lc.tool.strokeWidth
      },

      //  drawingBoard: small stroke
      smallSize() {
        this.lc.tool.strokeWidth = 2

        if( this.isDotPointer )
          this.setDotPointer()
      },

      //  drawingBoard: medium stroke
      mediumSize() {
        this.lc.tool.strokeWidth = 5

        if( this.isDotPointer )
          this.setDotPointer()
      },

      //  drawingBoard: big stroke
      bigSize() {
        this.lc.tool.strokeWidth = 10

        if( this.isDotPointer )
          this.setDotPointer()
      },

      //  drawingBoard: sets a dash line
      dashLine() {
        this.lc.tool.isDashed = !this.lc.tool.isDashed

        $( '[id*="dash"]' ).toggleClass( 'selected' )
      },

      //  drawingBoard: sets line as arrow
      arrowLine() {
        this.lc.tool.hasEndArrow = !this.lc.tool.hasEndArrow

        $( '[id*="arrow"]' ).toggleClass( 'selected' )
      },

      //  drawingBoard: shows settings for line tool
      showLineSettings() {
        this.displayLineSettings = true
      },

      //  drawingBoard: hides settings for line tool
      hideLineSettings() {
        this.displayLineSettings = false
      },

      //  drawingBoard: sets up the color of tool
      setColor( type ) {
        this.$nextTick( () => {
          let self = this
          let $sel = $('.vc-compact-color-item').filter( function() {
            return $( this ).find( '.vc-compact-dot' ).css( 'display' ) == 'block'
          })
          let colorCode = this.getPickedColor( $sel.attr('aria-label') )

          this.colorMap[ type ].el.css( 'backgroundColor', colorCode )
          this.colorMap[ type ].el.data( 'backgroundColor', colorCode )
          self.resetPickers()
        })
      },

      //  drawingBoard: 
      setPickerColor( type ) {
        let color = this.getTool( type ).el.data('backgroundColor')

        $('.vc-compact-dot').hide()
        if( color ) {
          $('.vc-compact-color-item').filter( function() {
            return $( this ).attr( 'aria-label' ).indexOf( color ) != -1
          }).find( '.vc-compact-dot' ).show()
        }
      },

      //  drawingBoard: resets pickers status
      resetPickers() {
        this.displayStrokePicker = false
        this.displayFillPicker = false
      },

      // resetToolSettings() {
      //   this.lc.setColor( 'primary', this.primaryColor )
      //   this.lc.setColor( 'secondary', this.secondaryColor )
      //   this.lc.tool.strokeWidth = this.strokeWidth
      // },

      //  toolCollection: returns a stack with filtered tool names
      getToolNames( filter ) {
        let stack = []

        this.tools.forEach( (tool) => {
          if( tool.name.toLowerCase().indexOf( filter ) != -1 )
            stack.push( tool.name )
        })

        return stack
      },

      //  toolCollection: returns a tool filtered by a name
      getTool( type ) {
        for( let i = 0; i < this.tools.length; i++ )
          if( this.tools[ i ].name.toLowerCase().indexOf(type) != -1 )
            return this.tools[ i ]

        return null
      },

      //  pickedColorBoard: makes a substring of the color label as "Color:#001122" returning the hash value
      getPickedColor( colorLabel ) {
        if( !colorLabel )
          return null

        return colorLabel.substring( colorLabel.indexOf(':')+1 )
      },

      //  UI: reset pointer settings
      resetPointer() {
        this.$drawingBoard.removeClass( 'pointerSmall' )
        this.$drawingBoard.removeClass( 'pointerMedium' )
        this.$drawingBoard.removeClass( 'pointerBig' )
        this.$drawingBoard.removeClass( 'pointerCross' )
        this.isDotPointer = false
      },

      //  UI: set cross pointer settings
      setCrossPointer() {
        this.$drawingBoard.addClass( 'pointerCross' )
      },

      //  UI: set pencil pointer settings
      setDotPointer() {
        this.resetPointer()

        this.$drawingBoard.addClass( 'pointer'+this.getPointerSize() )
        this.isDotPointer = true
      },

      //  UI: get current pointer size
      getPointerSize() {
        return {
          2: 'Small',
          5: 'Medium',
          10: 'Big',
        }[this.lc.tool.strokeWidth]
      },

      //  UI: activate the size on
      toActivateSize() {
        let map = {
          2: 'small',
          5: 'medium',
          10: 'big',
        }

        return this.$sizeTools.filter( 
          (i, el) => $(el).attr('id').toLowerCase().indexOf(map[this.lc.tool.strokeWidth]) != -1
        ).trigger('click')
      },

    },

    data() {
      return {
        //  status, data
        lc: null,
        tools: null,
        activeToolName: null,
        displayStrokePicker: false,
        displayFillPicker: false,
        displayLineSettings: false,
        activeColorID: null,
        activeColorType: null,
        colors,
        tabsNo: 1,
        exportCallback: null,
        isDotPointer: null,
        primaryColor: 'black',
        secondaryColor: 'white',
        strokeWidth: null,
        onExporting: false,

        //  mappers
        colorMap: null,

        //  jQuery objects
        $colorPicker: null,
        $colorPickerItems: null,
        $drawingBoard: null,
        $sizeTools: null
      }
    }

  }
</script>