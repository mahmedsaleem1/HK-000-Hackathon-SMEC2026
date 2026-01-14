import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchRecord extends Document {
  cityName: string;
  latitude: number;
  longitude: number;
  airQualityIndex: number;
  qualityLabel: string;
  pollutants: {
    sulphurDioxide: number;
    nitrogenDioxide: number;
    pm10: number;
    pm25: number;
    ozone: number;
    carbonMonoxide: number;
  };
  searchedAt: Date;
}

const searchRecordSchema: Schema = new Schema({
  cityName: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  airQualityIndex: {
    type: Number,
    required: true
  },
  qualityLabel: {
    type: String,
    required: true
  },
  pollutants: {
    sulphurDioxide: Number,
    nitrogenDioxide: Number,
    pm10: Number,
    pm25: Number,
    ozone: Number,
    carbonMonoxide: Number
  },
  searchedAt: {
    type: Date,
    default: Date.now
  }
});

const SearchHistory = mongoose.model<ISearchRecord>('SearchHistory', searchRecordSchema);

export default SearchHistory;
