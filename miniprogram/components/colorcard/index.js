// components/colorcard/index.js
const getImageFillInfo = require( '../../utils/getImageFillInfo' )
const colorThief = require( '../../utils/colorplugin/colorthief' )

Component( {
  /**
   * 组件的属性列表
   */
  properties: {
    // 图片临时路径
    imagePath: {
      type: String,
      value: null,
      observer: function ( newImagePath ) {
        if(!newImagePath) return;
        wx.getImageInfo( {
          src: newImagePath,
          success: info => {
            this.setData( { info, palettes: [] }, () => this.draw() )
          },
          fail: err => {
            console.log( '获取图片信息失败', err )
          }
        } )
      }
    },
    //色块颜色
    palettes: {
      type: Array,
      value: [],
      observer: function ( ) {
        if(!this.data.imagePath) {
          return;
        } else {
          this.draw()
        }
      }
    },
    paletteHeight: {
      type: Number,
      value: 60
    },
    // 色块显示数目
    num: {
      type: Number,
      value: 10
    },
    //轮廓宽度
    borderWidth: {
      type: Number, // 0 - 325
      value: 0
    },
    //轮廓颜色
    borderColor: {
      type: String,
      value: '#fff'//'rgba(0, 0, 0, 0)'
    },
    // 图片填充方式
    imageFillStyle: {
      type: String,
      value: 'original'
    },
    // 颜色代码显示方式
    colorCodeStyle: {
      type: String,
      value: 'hex'
    },
    // 是否显示颜色代码详情/文字
    showColorCode: {
      type: Boolean,
      value: false
    },
    // 颜色代码排版
    colorCodeLayout: {
      type: String,
      value: 'one'//two, three
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    width: 750, // 画布大小
    height: 800 // 画布大小
  },

  lifetimes: {
    ready: function () {
      const systemInfo = wx.getSystemInfoSync()
      const windowWidth = systemInfo.windowWidth;
      const windowHeight = systemInfo.windowHeight;
      this.setData( {
        windowWidth,
        windowHeight,
        width: windowWidth,//px 
        height: windowHeight//px
      } )
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    draw () {
      if(!this.data.imagePath) {
        return;
      }
      wx.showLoading( {
        title: '绘制中',
        mask: true
      } )

      const ctx = wx.createCanvasContext( 'myCanvas', this )
      const Width = this.data.width;
      const Height = this.data.height;
      const paletteHeight = ( Number(this.data.paletteHeight) / 750 ) * this.data.windowWidth;
      const borderWidth = ( Number(this.data.borderWidth) / 750 ) * this.data.windowWidth;
      ctx.clearRect( 0, 0, Width, Height + paletteHeight );

      // draw background color 
      ctx.setFillStyle( this.data.borderColor );
      ctx.fillRect( 0, 0, Width, Height );

      // draw image 
      if ( this.data.imagePath ) {
        let { dx, dy, dw, dh, sx, sy, sw, sh } =
          getImageFillInfo( this.data.imageFillStyle, this.data.info, borderWidth, borderWidth, this.data.windowWidth - 2 * borderWidth, this.data.windowHeight - paletteHeight - 3 * borderWidth );
        if ( this.data.imageFillStyle === 'original' ) {
          this.setData( {
            height: dh + borderWidth * 3 + paletteHeight
          })
          ctx.drawImage( this.data.imagePath, sx, sy, sw, sh, dx, dy, dw, dh )
        } else {
          ctx.drawImage( this.data.imagePath, sx, sy, sw, sh, dx, dy, dw, dh );
        }
      }

      // draw palettes 
      let num = this.data.palettes.length;
      if ( this.data.palettes.length && num ) {
        const paletteWidth = ( Width - borderWidth * ( num + 1 ) ) / num;
        const offsetHeight = Height - paletteHeight - borderWidth;
        for ( let i = 0; i < num; i++ ) {
          let offsetLeft = borderWidth * ( i + 1 ) + i * paletteWidth;
          ctx.setFillStyle( this.data.palettes[i] )
          ctx.fillRect(
            offsetLeft,
            offsetHeight,
            paletteWidth,
            paletteHeight
          )
        }
      }

      wx.nextTick( () => {
        ctx.draw( false, () => {
          wx.showToast( {
            title: '绘制成功',
            icon: 'success'
          } );
        } );
      } );
    },

    setImagePath ( imagePath ) {
      wx.getImageInfo( {
        src: imagePath,
        success: info => {
          this.setData( { info, palettes: [] }, () => this.draw() )
          resolve()
        },
        fail: err => {
          reject( err )
        }
      } )
    },

    setPalettes ( palettes ) {
      this.setData( { palettes }, () => this.draw() )
    },

    getColorByType ( imagedata ) {
      switch ( this.data.colorCodeStyle ) {
        case 'rgb':
          return colorThief( imagedata ).palette( this.data.num + 1 ).get().map( arr => `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})` )
        case 'hex':
          return colorThief( imagedata ).palette( this.data.num + 1 ).getHex()
        case 'gray':
          return colorThief( imagedata ).palette( this.data.num + 1 ).getGray().map( gray => `rgb(${parseInt( gray )}, ${parseInt( gray )}, ${parseInt( gray )})` )
        default:
          return colorThief( imagedata ).palette( this.data.num + 1 ).getHex()
      }
    },

    startAnalyse () {
      if ( !this.data.imagePath ) return;
      return new Promise( ( resolve, reject ) => {
        wx.showLoading( {
          title: '分析中',
          mask: true
        } )
        const Width =  this.data.width;
        const Height = this.data.height;
        const paletteHeight = ( this.data.paletteHeight / 750 ) * this.data.windowWidth;
        const borderWidth = ( this.data.borderWidth / 750 ) * this.data.windowWidth;
        wx.canvasGetImageData( {
          canvasId: 'myCanvas',
          x: borderWidth,
          y: borderWidth,
          width: Width - 2 * borderWidth,
          height: Height - 3 * borderWidth - paletteHeight,
          success: res => {
            let palettes = this.getColorByType( res.data )
            this.setData( { palettes }, () => {
              resolve( palettes )
            })
          },
          fail: err => {
            wx.hideLoading()
            console.error( err )
            reject(err)
          },
          complete () {
            wx.hideLoading()
          }
        }, this )
      } )
    }
  }
} )
