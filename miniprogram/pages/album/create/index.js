const app = getApp()

Page( {

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    description: '',
    hasCoverImage: false
  },

  bindTitleInput ( e ) {
    this.setData( {
      title: e.detail.value
    } )
  },
  bindDescInput ( e ) {
    this.setData( {
      description: e.detail.value
    } )
  },
  chooseImage ( e ) {
    app.globalApi.imageApi.chooseImage().then( res => {
      console.log( res )
      this.setData( {
        hasCoverImage: true,
        imagePath: res
      } )
    } ).catch( err => {
      wx.showToast( {
        title: '选择失败',
        icon: 'none'
      } )
      this.setData( {
        hasCoverImage: false,
        imagePath: null
      } )
    } )
  },

  addAlbum () {
    let { title, description, imagePath } = this.data;
    if ( title.trim() === '' ) {
      wx.showToast( { title: '标题能不为空', icon: 'none' } )
      return;
    } else {
      wx.showLoading( {
        title: '创建中',
        mask: true
      } );
      if ( !imagePath ) {
        app.globalApi.albumApi.addAlbum( {
          title,
          description,
          coverImage: 'none'
        } ).then( res => {
          app.emitAddAlbum( {
            album: {
              _id: res._id,
              title,
              description,
              coverImage: 'none'
            }
          } )
          wx.showToast( {
            title: '创建成功',
            duration: 1200,
            success: res => {
              setTimeout( () => {
                wx.navigateBack( {
                  delta: 1
                } );
              }, 1200 );
            },
            fail: err => {
              console.error( err )
            }
          } )
        } ).catch( err => {
          console.log( err )
          wx.showToast( {
            title: '创建失败',
            icon: 'none'
          } )
        } )
      } else {
        app.globalApi.imageApi.uploadImage( imagePath ).then( res => {
          let { fileID } = res
          app.globalApi.albumApi.addAlbum( {
            title,
            description,
            coverImage: fileID
          } ).then( res => {
            app.emitAddAlbum( {
              album: {
                _id: res._id,
                title,
                description,
                coverImage: fileID,
                coverImageURL: imagePath
              }
            } )
            wx.showToast( {
              title: '创建成功',
              duration: 1200,
              success: res => {
                setTimeout( () => {
                  wx.navigateBack( {
                    delta: 1
                  } );
                }, 1200 );
              },
              fail: err => {
                console.error( err )
              }
            } )
          } ).catch( err => {
            console.log( err )
            wx.showToast( {
              title: '创建失败',
              icon: 'none'
            } )
          } )
        } ).catch( err => {
          console.log( err )
          wx.showToast( {
            title: '创建失败',
            icon: 'none'
          } )
        } )
      }
    }
  }
} )