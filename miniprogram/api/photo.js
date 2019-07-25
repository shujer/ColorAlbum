const app = getApp();
const db = wx.cloud.database();
const { transferArrayToObj } = require( '../utils/transfer' );

function addPhoto ( { title = '', description = '', albumID, fileID, photoSettings = {} } ) {
    return new Promise( ( resolve, reject ) => {
        db.collection( 'photo' ).add( { 
            data: {
                title,
                description,
                albumID,
                fileID,
                photoSettings
            }
         } ).then( res => {
            let { _id } = res;
            app.globalData.photos[_id] = data;
            resolve( res );
        } ).catch( err => {
            console.error( '[数据库][add]调用失败', err );
            reject( err );
        } )
    } )
}

function deletePhoto ( id ) {
    return new Promise( ( resolve, reject ) => {
        db.collection( 'photo' ).where( { _id: id } ).remove().then( res => {
            app.globalData.photos[id] = null;
            resolve( res );
        } ).catch( err => {
            console.error( '[数据库][remove]调用失败', err );
            reject( err );
        } )
    } )
}

function editPhoto ( id, data ) {
    return new Promise( ( resolve, reject ) => {
        db.collection( 'photo' ).doc( id ).update( { data } ).then( res => {
            app.globalData.photos[id] = { ...app.globalData.photos[id], ...data };
            resolve( res );
        } ).catch( err => {
            console.error( '[数据库][add]调用失败', err );
            reject( err );
        } )
    } )
}

function getPhoto ( openid ) {
    return new Promise( ( resolve, reject ) => {
        // get data form memory 
        if ( app.globalData.photos ) {

            resolve( app.globalData.photos );

        } else {
            // get data from local storage 
            wx.getStorage( {
                key: 'photo',
                success: res => {
                    app.globalData.photos = res;
                    resolve( res )
                },
                fail: err => {
                    console.error( '[getPhoto][getStorage]失败', err )
                    db.collection( 'photo' )
                        .where( { _openid: openid } )
                        .get().then( ( { data } ) => {
                            let photos = transferArrayToObj('_id', data );
                            app.globalData.photos = { ...app.globalData.photos, ...photos };
                            resolve( photos );
                        } ).catch( err => {
                            console.error( '[数据库] [get] 调用失败', err )
                            reject( err )
                        } )
                }
            } )
        }
    } )
}

module.exports = {
    getPhoto,
    addPhoto,
    deletePhoto,
    editPhoto
}