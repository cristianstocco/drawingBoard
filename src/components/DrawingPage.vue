<template>

  <div>
    <div class="tabs">
      <div class="tabList">
        <div id="tab1" class="active">TAB 1</div>
      </div>
      <div id="addTab" @click="newTab">+</div>
    </div>

    <div class="areas" ref="areas">
		<DrawingArea name="drawingArea1" />
	</div>
  </div>

</template>

<script>
  // === LIBRARIES
  import DrawingArea    from './DrawingArea.vue'
  import Vue			from 'vue'
  import jQuery         from 'jquery'

  // === GLOBALS
  window.jQuery = window.$ = jQuery

  // === LOCAL
  var ComponentClass = Vue.extend(DrawingArea)

  export default {

    components: {
      DrawingArea
    },

    mounted () {
      //  set-up UI
      this.tabDimension()
    },

    methods: {
      //  UI: adds a tab
      newTab() {
        if( this.tabs_no == 5 ) {
          window.alert( 'you can create only 5 tabs' )
          return
        }

        let $newTab = $( document.createElement('div') )
        let $tabList = $( '.tabs .tabList' )

        //	creating and appending new tab
        $newTab.attr( 'id', this.getTabID() ).text( this.getTabText() )
        $tabList.append( $newTab )

        let $tabs = $( '.tabList div' );
        
        //	resetting UI
        $tabs
          .removeClass( this.getWidthClass() )
          .removeClass( 'active' )

        this.tabs_no++

        $tabs.addClass( this.getWidthClass() )
        $newTab.addClass( 'active' )

        //	set up drawingArea
        this.createDrawingArea()
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
        return 'tab'+( this.tabs_no+1 )
      },

      //  UI: returns the text for new tab
      getTabText() {
        return 'TAB '+( this.tabs_no+1 )
      },

      //  UI: returns the value of the width class based on the tub number
      getWidthClass() {
        switch( this.tabs_no ) {
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
      },

      createDrawingArea() {
      	window.console.log( "called createDrawingArea "+ComponentClass )
      	let da = new ComponentClass({
      		propsData: {name: "drawingArea"+this.tabs_no}
      	})
      	da.$mount()

      	// $( 'div.areas' ).append( da )
      	this.$refs.areas.appendChild( da.$el )
      }

    },

    data() {
      return {
        tabs_no: 1
      }
    }

  }
</script>

<style scoped>
  @import './css/literallycanvas-core.css'
</style>
<style scoped>
  @import './css/drawingarea.css'
</style>
