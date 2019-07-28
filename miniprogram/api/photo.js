const app = getApp();
const db = wx.cloud.database();
const { transferArrayToObj } = require( '../utils/transfer' );

function addPhoto ( data ) {
    return new Promise( ( resolve, reject ) => {
        db.collection( 'photo' ).add( {
            data: {
                ...data,
                due: new Date()
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
        db.collection( 'photo' ).doc( id ).remove().then( res => {
            let {[id]: data, ...rest} = app.globalData.photos;
            app.globalData.photos = rest;
            console.log( app.globalData.photos )
            resolve( res );
        } ).catch( err => {
            console.error( '[数据库][remove]调用失败', err );
            reject( err );
        } )
    } )
}

function deletePhotosByAlbumID ( id ) {
    return new Promise( ( resolve, reject ) => {
        wx.cloud.callFunction( {
            // 云函数名称
            name: 'deleteitems',
            // 传给云函数的参数
            data: {
                collection: 'photo',
                option: {
                    album: {
                        "_id": id
                    }
                }
            },
            success: function ( res ) {
                console.log( res ) // 3
                resolve( res )
            },
            fail: err => {
                console.error( '[云函数][deleteitems]调用失败', err )
                reject( err )
            }
        } )
    } )
}

function editPhoto ( id, data ) {
    return new Promise( ( resolve, reject ) => {
        db.collection( 'photo' ).doc( id ).update( { data } ).then( res => {
            app.globalData.photos[id] = { ...app.globalData.photos[id], ...album };
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
                .doc( id )
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


function getPhotosByTime ( openid, limit = 10, due ) {
    return new Promise( ( resolve, reject ) => {
        const _ = db.command
        db.collection( 'photo' )
            .where( { _openid: openid, due: _.lt( due ) } )
            .orderBy( 'due', 'desc' )
            .limit( limit )
            .get().then( ( { data } ) => {
                let photos = transferArrayToObj( '_id', data );
                app.globalData.photos = { ...app.globalData.photos, ...photos };
                resolve( data );
            } ).catch( err => {
                console.error( '[数据库] [get] 调用失败', err )
                reject( err )
            } )
    } )
}

function getPhotosByAlbumID ( openid, albumID, limit = 10, due ) {
    return new Promise( ( resolve, reject ) => {
        const _ = db.command
        db.collection( 'photo' )
            .where( { _openid: openid, album: { _id: albumID }, due: _.lt( due ) } )
            .orderBy( 'due', 'desc' )
            .limit( limit )
            .get().then( ( { data } ) => {
                let photos = transferArrayToObj( '_id', data );
                app.globalData.photos = { ...app.globalData.photos, ...photos };
                resolve( data );
            } ).catch( err => {
                console.error( '[数据库] [get] 调用失败', err )
                reject( err )
            } )
    } )
}

function getFileIDsByAlbumID ( openid, albumID ) {
    return new Promise( ( resolve, reject ) => {
        const _ = db.command
        db.collection( 'photo' )
            .where( { _openid: openid, album: { _id: albumID } } )
            .field( {
                fileID: true
            } )
            .get().then( ( { data } ) => {
                resolve( data );
            } ).catch( err => {
                console.error( '[数据库] [get] 调用失败', err )
                reject( err )
            } )
    } )
}

module.exports = {
    getPhotosByTime,
    addPhoto,
    deletePhoto,
    editPhoto,
    getPhotoDetailById,
    getPhotosByAlbumID,
    deletePhotosByAlbumID,
    getFileIDsByAlbumID
}