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
          <BorderedTool name="colorStroke" @click="colorStroke"/>
          <BorderedTool name="colorFill" @click="colorFill"/>
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
      let __this__            = this
      let drawingBoardHeight  = $(window).height() - $('.controls').height() - $('.tabs').height()
      let imageSize           = { width: null, height: null }
      let $colorPicker        = $drawingArea.find('.vc-compact')
      let $sizeTools          = $drawingArea.find('a[id*="Size"]')
      this.$drawingBoard      = $drawingArea.find('.literally.core')
      this.$colorPicker       = $( '.vc-compact-colors' )
      this.$colorPickerItems  = $( '.vc-compact-color-item' )

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
          primaryColor: 'black',
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
          pointerDisplay: true
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

      //  set-up general tool activation
      this.tools.forEach( (tool) => {
        tool.el.click( (e) => {
          e.preventDefault()
          this.activateTool(tool)
        })
      })
      this.activatePreviousTool()

      //  set-up size tool activation
      $sizeTools.click( function(e) {
        e.preventDefault()
        __this__.activateSizeStroke($(this), $sizeTools)
      })
      $sizeTools.eq(0).trigger( 'click' )

      //  set-up UI
      this.tabDimension()

      //  events
      $colorPicker.click( this.onColorSelect )
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

        if( tool.pointerDisplay )
          this.setPencilPointer()
        else
          this.setDefaultPointer()

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
      activateSizeStroke($tool, $sizeTools) {
        $sizeTools.removeClass( 'selected' )
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
        this.activeToolName = tool.tool.name.toLowerCase()
      },

      //  drawingBoard: triggers when click on export
      onExport() {
        let __this__ = this

        this.exportSettings()
        this.setCrossPointer()
        this.exportCallback = this.lc.on( 'shapeSave', this.exportSVG )
      },

      //  drawingBoard: settings for export
      exportSettings() {
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
        this.activatePreviousTool() //  to add colors settings
        this.exportCallback()
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
        this.setActiveStatus( 'stroke' )
        this.setActiveColor()

        //  setTimeout for switching color picker mode
        setTimeout(
          () => {this.showColorPicker()},
          10
        )
      },

      //  drawingBoard: sets up the fill color
      colorFill() {
        this.setActiveStatus( 'fill' )
        this.setActiveColor()

        //  setTimeout for switching color picker mode
        setTimeout(
          () => {this.showColorPicker()},
          10
        )
      },

      //  drawingBoard: sets up the status for the next color choice
      setActiveStatus( filter ) {
        this.tools.forEach( (tool) => {
          if( tool.name.toLowerCase().indexOf( filter ) != -1 ) {
            this.activeColorID = tool.name
            this.activeColorType = tool.type
          }
        })
      },

      //  drawingBoard: sets up the color for the current color
      setActiveColor() {
        let __this__ = this
        let colorCode = $( '#'+this.activeColorID ).data( 'backgroundColor' )

        this.$colorPickerItems.find( '.vc-compact-dot' ).hide()
        this.$colorPickerItems.filter( function() {
          return __this__.getPickedColor( $( this ).attr( 'aria-label' ) ) == colorCode
        }).find( '.vc-compact-dot' ).show()
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

      //  drawingBoard: sets a dash line
      dashLine() {
        this.lc.tool.__proto__.isDashed = !this.lc.tool.__proto__.isDashed

        $( '[id*="dash"]' ).toggleClass( 'selected' )
      },

      //  drawingBoard: sets line as arrow
      arrowLine() {
        this.lc.tool.__proto__.hasEndArrow = !this.lc.tool.__proto__.hasEndArrow

        $( '[id*="arrow"]' ).toggleClass( 'selected' )
      },

      //  drawingBoard: shows the color picker pop-up
      showColorPicker() {
        this.displayColorPicker = true
        this.deactivateTools()

        //  setTimeout for trigger at the next input click
        setTimeout( () => {
          this.outsideClick(
            () => {this.onColorSelect( null )},
            this.$colorPicker
          )
        }, 1 )
      },

      //  drawingBoard: hides the color picker pop-up
      hideColorPicker() {
        this.displayColorPicker = false
        this.activatePreviousTool()
      },

      //  drawingBoard: shows settings for line tool
      showLineSettings() {
        this.displayLineSettings = true
      },

      //  drawingBoard: hides settings for line tool
      hideLineSettings() {
        this.displayLineSettings = false
      },

      //  drawingBoard: sets up the color of tool using the status
      setColor( colorCode ) {
        $( '#'+this.activeColorID ).css( 'backgroundColor', colorCode )
        $( '#'+this.activeColorID ).data( 'backgroundColor', colorCode )  //  saving backgroundColor since the hover is repainting the div
        this.lc.setColor( this.activeColorType, colorCode )
      },

      //  drawingBoard: triggers when clicked on a color square
      onColorSelect( e ) {
        if( e )
          e.preventDefault()

        //  setTimeout to wait the click event on the color element
        setTimeout( () => {
          let colorCode = this.getPickedColor( this.$colorPickerItems.filter( function() {
            return $( this ).find( '.vc-compact-dot' ).css( 'display' ) == 'block'
          }).attr('aria-label') )

          this.setColor( colorCode )
          this.hideColorPicker()
        }, 1)
      },

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
      getTool( name ) {
        for( let i = 0; i < this.tools.length; i++ )
          if( this.tools[ i ].name.toLowerCase().indexOf(name) != -1 )
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
      setDefaultPointer() {
        this.$drawingBoard.removeClass( 'pointerNone' )
        this.$drawingBoard.removeClass( 'pointerCross' )
      },

      //  UI: set cross pointer settings
      setCrossPointer() {
        this.$drawingBoard.addClass( 'pointerCross' )
      },

      //  UI: set pencil pointer settings
      setPencilPointer() {
        this.$drawingBoard.addClass( 'pointerSmall' )
      },

      //  UI: adds a tab
      newTab() {
        if( this.tabsNo == 5 ) {
          window.alert( 'you can create only 5 tabs' )
          return
        }

        let $newTab = $( document.createElement('div') )
        let $tabList = $( '.tabs .tabList' )

        $newTab.attr( 'id', this.getTabID() ).text( this.getTabText() )
        $tabList.append( $newTab )

        let $tabs = $( '.tabList div' );
        
        $tabs
          .removeClass( this.getWidthClass() )
          .removeClass( 'active' )
        this.tabsNo++
        $tabs.addClass( this.getWidthClass() )
        $newTab.addClass( 'active' )
      },

      //  UI: sets up the tab bar dimension
      tabDimension() {
        let tabListWidth = $( window ).width() - $( '#addTab' ).width() - 1

        $( '.tabs .tabList' )
          .css( 'width', tabListWidth + 'px' )
          .find( 'div' )
          .addClass( 'w100p' )
      },

      //  UI: returns the value of the id attribute for a new tab
      getTabID() {
        return 'tab'+( this.tabsNo+1 )
      },

      //  UI: returns the text for new tab
      getTabText() {
        return 'TAB '+( this.tabsNo+1 )
      },

      //  UI: returns the value of the width class based on the tub number
      getWidthClass() {
        switch( this.tabsNo ) {
          case 1:
            return 'w100p'
          case 2:
            return 'w50p'
          case 3:
            return 'w33p'
          case 4:
            return 'w25p'
          case 5:
            return 'w20p'
          default:
            return null;
        }
      }

    },

    data() {
      return {
        //  status, data
        lc: null,
        tools: null,
        activeToolName: null,
        displayColorPicker: false,
        displayLineSettings: false,
        activeColorID: null,
        activeColorType: null,
        colors,
        tabsNo: 1,
        exportCallback: null,

        //  jQuery objects
        $colorPicker: null,
        $colorPickerItems: null,
        $drawingBoard: null
      }
    }

  }
</script>