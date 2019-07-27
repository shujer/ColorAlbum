const app = getApp()
const { transferArrayToObj } = require( '../utils/transfer' );

function chooseImage ( {
    count = 1,
    sizeType = ['compressed'],
    sourceType = ['album', 'camera'] } = {} ) {
    return new Promise( ( resolve, reject ) => {
        wx.showLoading( {
            title: '请稍候',
            mask: true
        } );

        wx.chooseImage( {
            count,
            sizeType,
            sourceType,
            success: res => {
                wx.hideLoading();
                const tempFilePath = res.tempFilePaths[0]
                resolve( tempFilePath )
            },
            fail: err => {
                wx.hideLoading();
                console.log( '[chooseImage]调用失败', err );
                reject( err );
            }
        } )
    } )
}

function uploadImage ( filePath ) {
    return new Promise( ( resolve, reject ) => {
        const cloudPath = 'color-album-' + Math.random().toFixed( 4 ) * 10000 + new Date().getTime() + filePath.match( /\.[^.]+?$/ )[0];
        wx.cloud.uploadFile( {
            cloudPath,
            filePath,
            success: res => {
                let { fileID } = res;
                app.globalData.tempFilePaths[fileID] = { tempFileURL: filePath, fileID }
                resolve( res )
            },
            fail: e => {
                console.log( '[云函数][uploadFile]调用失败', err );
                reject( err )
            }
        } )
    } )
}

function getImagesByFileID ( fileIDs ) {
    return new Promise( ( resolve, reject ) => {
        let rest = [], file, result = new Array( fileIDs.length );
        fileIDs.forEach( ( fileID, index ) => {
            file = app.globalData.tempFilePaths[fileID]
            if ( file ) {
                result[index] = file;
            } else {
                if ( fileIDs[index].fileID !== 'none' ) {
                    rest.push( index );
                }
            }
        } )
        if ( rest.length === 0 ) {
            resolve( result );
        }
        // read from request
        wx.cloud.getTempFileURL( {
            fileList: rest.map( index => fileIDs[index] ),
            success: res => {
                rest.forEach( ( index, i ) => result[index] = res.fileList[i] );
                let tempFilePaths = transferArrayToObj( 'fileID', result )
                app.globalData.tempFilePaths = { ...tempFilePaths, ...app.globalData.tempFilePaths }
                resolve( result )
            },
            fail: err => {
                console.error( '[云函数][getTempFileURL]调用失败', err );
                reject( err );
            }
        } )

    } )
}

function getImageByFileID ( fileID ) {
    return new Promise( ( resolve, reject ) => {
        let { tempFileURL } = app.globalData.tempFilePaths[fileID]
        if ( tempFileURL ) {
            if ( tempFileURL.includes( 'http://tmp' ) ) {
                console.log( tempFileURL )
                resolve( tempFileURL )
            } else {
                wx.getImageInfo( {
                    src: tempFileURL,
                    success: res => {
                        app.globalData.tempFilePaths[fileID] = { tempFileURL: res.path, fileID }
                        resolve( res.path )
                    },
                    fail: err => {
                        console.error( '[getImageInfo]加载图片信息失败', err );
                        reject( err )
                    }
                } )
            }
        } else {
            wx.cloud.downloadFile( {
                fileID,
                success: res => {
                    app.globalData.tempFilePaths[fileID] = { tempFileURL: res.tempFilePath, fileID }
                    resolve( res.tempFilePath )
                },
                fail: err => {
                    console.error( '[云函数][downloadFile]加载图片信息失败', err );
                    reject( err )
                }
            } )
        }
    } )
}

function deleteImageByFileID ( fileID ) {
    return wx.cloud.deleteFile( {
        fileList: [fileID]
    } )
}

module.exports = {
    chooseImage,
    uploadImage,
    getImagesByFileID,
    getImageByFileID,
    deleteImageByFileID
}