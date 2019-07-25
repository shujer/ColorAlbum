const app = getApp()
const { transferArrayToObj } = require( '../utils/transfer' );

function chooseImage ( {
    count = 1,
    sizeType = ['compressed'],
    sourceType = ['album', 'camera'] } = {}) {
    return new Promise( ( resolve, reject ) => {
        wx.chooseImage( {
            count,
            sizeType,
            sourceType,
            success: res => {
                const tempFilePath = res.tempFilePaths[0]
                resolve( tempFilePath )
            },
            fail: err => {
                console.log( '[chooseImage]调用失败', err );
                reject( err );
            }
        } )
    } )
}

function uploadImage ( tempFilePath ) {
    return new Promise( ( resolve, reject ) => {
        const cloudPath = 'color-album-' + Math.random().toFixed( 4 ) * 10000 + new Date().getTime() + tempFilePath.match( /\.[^.]+?$/ )[0];
        wx.cloud.uploadFile( {
            cloudPath,
            filePath: tempFilePath,
            success: res => {
                let { fileID, cloudPath, tempFilePath } = res;
                app.globalData.tempFilePaths[fileID] = tempFilePath
                resolve( res )
            },
            fail: e => {
                console.log( '[云函数][uploadFile]调用失败', err );
                reject( err )
            }
        } )
    } )
}

function getImageByFileID ( fileIDs ) {
    return new Promise( ( resolve, reject ) => {
        let rest = [], file, result = new Array( fileIDs.length );
        fileIDs.forEach( ( fileID, index ) => {
            file = app.globalData.tempFilePaths[fileID]
            if ( file ) {
                result[index] = file;
            } else {
                if(fileIDs[index].fileID !== 'none') {
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
                app.globalData.tempFilePaths = { ...app.globalData.tempFilePaths, ...tempFilePaths }
                resolve( result )
            },
            fail: err => {
                console.error( '[云函数][getTempFileURL]调用失败', err );
                reject( err );
            }
        } )

    } )
}

module.exports = {
    chooseImage,
    uploadImage,
    getImageByFileID
}