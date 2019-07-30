const app = getApp()

Page( {

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    description: '',
    hasCoverImage: false,
    hasChange: false,
    imagePath: 'none'
  },

  onLoad ( options ) {
    let { id } = options
    if ( !id ) {
      wx.navigateBack( {
        delta: 1
      } )
    }
    wx.showLoading( {
      title: '加载中'
    } )
    app.globalApi.albumApi.getAlbumDetailById( id ).then( album => {
      this.setData( {
        id,
        ...album
      } )
      if ( album.coverImage !== 'none' ) {
        app.globalApi.imageApi.getImageByFileID( album.coverImage ).then( res => {
          this.setData( {
            imagePath: res,
            hasCoverImage: true
          } )
        } )
      }
      wx.hideLoading();
    } ).catch( err => {
      wx.showToast( {
        title: '加载失败',
        icon: 'none'
      } )
    } )
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
      this.setData( {
        hasCoverImage: true,
        imagePath: res,
        hasChange: true
      } )
    } ).catch( err => {
      wx.showToast( {
        title: '选择失败',
        icon: 'none'
      } )
      this.setData( {
        hasCoverImage: false,
        imagePath: null,
        hasChange: true
      } )
    } )
  },

  editAlbum () {
    let { title, description, imagePath, hasChange, coverImage } = this.data;
    if ( title.trim() === '' ) {
      wx.showToast( { title: '标题能不为空', icon: 'none' } )
      return;
    } else {
      wx.showLoading( {
        title: '更新中',
        mask: true
      } );
      if ( !imagePath || !hasChange ) {
        let album = {
          title,
          description,
          coverImage: hasChange ? 'none' : coverImage,
          coverImageURL: imagePath
        }
        app.globalApi.albumApi.editAlbum( this.data.id, album ).then( res => {
          app.emitEditAlbum( {
            album: {
              _id: this.data.id,
              ...album
            }
          } )
          wx.showToast( {
            title: '更新成功',
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
            title: '更新失败',
            icon: 'none'
          } )
        } )
      } else {
        app.globalApi.imageApi.uploadImage( imagePath ).then( res => {
          let { fileID } = res
          let album = {
            title,
            description,
            coverImage: fileID,
            coverImageURL: imagePath
          }
          app.globalApi.albumApi.editAlbum( this.data.id, album ).then( res => {
            app.emitEditAlbum( {
              album: {
                _id: this.data.id,
                ...album
              }
            } )
            wx.showToast( {
              title: '更新成功',
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
              title: '更新失败',
              icon: 'none'
            } )
          } )
        } ).catch( err => {
          console.log( err )
          wx.showToast( {
            title: '更新失败',
            icon: 'none'
          } )
        } )
      }
    }
  }
} )