'use strict';

// const Promise             = require('bluebird');
const debug               = require('debug')('todo:itemCtrl');
const Item                = require(`${__dirname}/item-model`);
const AppError            = require(`${__dirname}/../../lib/app-error`);
const listCtrl            = requre(`${__dirname}/../list/list-controller`);

const itemCtrl            = module.exports = {};

itemCtrl.newItem          = newItem;
itemCtrl.getAllItems      = getAllItems;
itemCtrl.getItem          = getItem;
itemCtrl.updateItem       = updateItem;
itemCtrl.deleteItem       = deleteItem;
itemCtrl.deleteAllItems   = deleteAllItems;


/**
 * newItem - creates a new item
 *  
 * @param  {object}   itemParams  an object with properties for all the fields of the item to be created 
 * @return {promise}              a promise that resolves with a newly saved item or rejects with an appError 
 */ 
function newItem(itemParams) {
  debug('newItem');
  return new Promise((resolve, reject) => {
    Item.createAsync(itemParams)
      .then((item) => {
        return resolve(item);
      })
      .catch((err) => {
        return reject(new AppError(400, err));
      });
  });
}


/**
 * getAllItems - finds all items that belong to a list with the given _id
 *  
 * @param  {string}   listId  the _id of the list whose items we want to find 
 * @return {promise}          a promise that resolves with all the items for that list or rejects with an appError 
 */ 
function getAllItems(listId) {
  debug('getAllItems');
  return new Promise((resolve, reject) => {
    if (!listId) {
      return reject(new AppError(404, 'no listId provided'));
    }
    Item.find({ list: listId })
      .exec((err, items) => {
        if (err) return reject(new AppError(404, err));
        return resolve(items);
      });
  });
}



/**
 * getList - finds an item by id
 *  
 * @param  {type}     itemId  the _id of the item to find 
 * @return {promise}          a promise that resolves with a found item or rejects with an appError 
 */ 
function getItem(itemId) {
  debug('getItem');
  return new Promise((resolve, reject) => {
    if (!itemId) return reject(new AppError(400, 'no itemId provided'));
    Item.findById(itemId, (err, item) => {
      if (err || !item) {
        return reject(new AppError(404, err || 'no item found'));
      } 
      return resolve(item);
    });
  });
}


/**
 * updateItem - updates an item's properties
 *  
 * @param  {string}     itemId      the _id of the item to update
 * @param  {object}     itemParams  the incoming request body detailing the changes to make 
 * @return {promise}                a promise that resolves with the updated item or rejects with an appError 
 */ 
function updateItem(itemId, itemParams) {
  debug('updateItem');
  return new Promise((resolve, reject) => {
    if (!itemParams || Object.keys(itemParams).length === 0) {
      return reject(new AppError(400, 'no update content provided'));
    }
    // TODO: figure out if I need to be more careful about which updates are being allowed through 
    Item.findOneAndUpdate({ _id: itemId }, 
      { $set: itemParams }, 
      { runValidators: true, new: true }, 
      (err, item) => {
        if (err || !item) {
          return reject(new AppError(400, err || 'no item existed, shouldnt have happened'));
        }
        return resolve(item);
      });
  });
}



/**
 * deleteItem - deletes a item from the database, removes references to it from its list
 *  
 * @param  {string} itemId  the _id of the item to delete  
 * @return {promise}        a promise that rejects with an appError or resolves with nothing 
 */ 
function deleteItem(itemId) {
  debug('deleteItem');
  return new Promise((resolve, reject) => {
    Item.findOneAndRemoveAsync({ _id: itemId })
      .then(() => {
        return resolve();
      })
      .catch((err) => {
        return reject(new AppError(400, err));
      });
  });
}



/**
 * deleteAllItems - deletes all items belonging to a list
 *  
 * @param  {string} listId  the _id of the list
 * @return {promise}        a promise that resolves with the deleted items or rejects with an appError 
 */ 
function deleteAllItems(listId) {
  debug('deleteAllItems');
  return new Promise((resolve, reject) => {
    Item.find({ list: listId })
      .remove()
      .exec((err, items) => {
        if (err) {
          return reject(new AppError(400, 'error deleting all items'));
        }
        return resolve(items);
      });
  });
}
