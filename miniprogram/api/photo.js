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

function getPhotoDetailById ( id ) {
    return new Promise( ( resolve, reject ) => {
        if ( app.globalData.photos[id] ) {
            resolve( app.globalData.photos[id] )
        } else {
            db.collection( 'photo' )
                .where( { _id: id } )
                .get().then( ( { data } ) => {
                    app.globalData.photos[id] = data[0]
                    resolve( data[0] )
                } ).catch( err => {
                    console.error( '[数据库] [get] 调用失败', err )
                    reject( err )
                } )
        }
    } )
}

function getPhotosByUser ( openid, skip = 0, limit = 10 ) {
    return new Promise( ( resolve, reject ) => {
        if ( !skip ) {
            db.collection( 'photo' )
                .where( { _openid: openid } )
                .limit( limit )
                .get().then( ( { data } ) => {
                    let photos = transferArrayToObj( '_id', data );
                    app.globalData.photos = { ...app.globalData.photos, ...photos };
                    resolve( data );
                } ).catch( err => {
                    console.error( '[数据库] [get] 调用失败', err )
                    reject( err )
                } )
        } else {
            db.collection( 'photo' )
                .where( { _openid: openid } )
                .skip( skip )
                .limit( limit )
                .get().then( ( { data } ) => {
                    let photos = transferArrayToObj( '_id', data );
                    app.globalData.photos = { ...app.globalData.photos, ...photos };
                    resolve( data );
                } ).catch( err => {
                    console.error( '[数据库] [get] 调用失败', err )
                    reject( err )
                } )
        }
    } )
}

module.exports = {
    getPhotosByUser,
    addPhoto,
    deletePhoto,
    editPhoto,
    getPhotoDetailById
}