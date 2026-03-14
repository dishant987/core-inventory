import mongoose from 'mongoose';
import { User, Category, Location, Product, Stock, Operation, StockLedger } from './models/index.js';

console.log('All models imported successfully!');

// Just instantiate one to ensure schemas are formulated properly without runtime errors during creation
const location = new Location({
    name: 'Main Warehouse',
    type: 'Warehouse',
});
console.log('Location formulated successfully:', location.name);
