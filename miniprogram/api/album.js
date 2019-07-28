const app = getApp();
const db = wx.cloud.database();
const { transferArrayToObj, transferObjToArray } = require( '../utils/transfer' );

function addAlbum ( data ) {
    return new Promise( ( resolve, reject ) => {
        let album = {
            ...data,
            due: new Date()
        }
        db.collection( 'album' ).add( {
            data: album
        } ).then( res => {
            let { _id } = res
            app.globalData.albums = {...app.globalData.albums, [_id]: {_id, ...album }};
            try {
                wx.setStorageSync( 'album', app.globalData.albums );
            } catch ( error ) {
                console.error( '[setStorageSync] [album] 调用失败', err );
            }
            resolve( res );
        } ).catch( err => {
            console.error( '[数据库][add]调用失败', err );
            reject( err );
        } )
    } )
}

function deleteAlbum ( id ) {
    return new Promise( ( resolve, reject ) => {
        db.collection( 'album' ).doc( id ).remove().then( res => {
            let {id, ...rest} = app.globalData.albums;
            app.globalData.albums = rest;
            try {
                wx.setStorageSync( 'album', app.globalData.albums );
            } catch ( error ) {
                console.error( '[setStorageSync] [album] 调用失败', err );
            }
            resolve( res );
        } ).catch( err => {
            console.error( '[数据库][remove]调用失败', err );
            reject( err );
        } )
    } )
}

function editAlbum ( id, data ) {
    return new Promise( ( resolve, reject ) => {
        let album = {
            ...data,
            due: new Date()
        }
        db.collection( 'album' ).doc( id ).update( { data } ).then( res => {
            app.globalData.albums[id] = { ...app.globalData.albums[id], ...album };
            try {
                wx.setStorageSync( 'album', app.globalData.albums );
            } catch ( error ) {
                console.error( '[setStorageSync] [album] 调用失败', err );
            }
            resolve( res );
        } ).catch( err => {
            console.error( '[数据库][update]调用失败', err );
            reject( err );
        } )
    } )
}

function getAlbumDetailById ( id ) {
    return new Promise( ( resolve, reject ) => {
        if ( app.globalData.albums[id] ) {
            resolve( app.globalData.albums[id] )
        } else {
            db.collection( 'album' )
                .doc( id )
                .get().then( ( { data } ) => {
                    app.globalData.albums[id] = data[0]
                    resolve( data[0] )
                } ).catch( err => {
                    console.error( '[数据库] [get] 调用失败', err )
                    reject( err )
                } )
        }
    } )
}

function getAlbumsByUser ( openid ) {
    return new Promise( ( resolve, reject ) => {
        // get data form memory 
        if ( app.globalData.albums ) {
            let albums = transferObjToArray( app.globalData.albums )
            resolve( albums );

        } else {
            app.globalData.albums = {}
            // get data from local storage   
            wx.getStorage( {
                key: 'album',
                success: res => {
                    console.log( res )
                    app.globalData.albums = res.data;
                    resolve( transferObjToArray( res.data ) )
                },
                fail: err => {
                    console.error( '[getAlbum][getStorage]失败', err )
                    db.collection( 'album' )
                        .where( { _openid: openid } )
                        .orderBy( 'due', 'desc' )
                        .get().then( ( { data } ) => {
                            let albums = transferArrayToObj( '_id', data );
                            app.globalData.albums = albums;
                            try {
                                wx.setStorageSync( 'album', albums );
                            } catch ( e ) {
                                console.error( '[setStorageSync] [album] 调用失败', err )
                            }
                            resolve( data );
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
    getAlbumsByUser,
    addAlbum,
    deleteAlbum,
    editAlbum,
    getAlbumDetailById
}