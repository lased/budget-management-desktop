import { NeuralNetwork, INeuralNetworkJSON } from 'brain.js';
import * as fs from 'fs';

import { Config } from '../../../core/config';

export class NeuralModel {
    range = 3;
    net: NeuralNetwork;
    lockFile: boolean;
    normalData: number[];
    data: number[];
    max: number;
    min: number;

    constructor(data: number[] = []) {
        this.data = data;
        this.max = Math.max.apply(null, this.data);
        this.min = Math.min.apply(null, this.data);
        this.lockFile = false;
        this.normalData = this.data.map(v => (v - this.min) / (this.max - this.min));
        this.net = new NeuralNetwork({
            hiddenLayers: [6, 3, 6],
            activation: 'sigmoid'
        });
        this.loadModel();
    }

    loadModel() {
        if (fs.existsSync(Config.model) && !this.lockFile) {
            const data: INeuralNetworkJSON = JSON.parse(fs.readFileSync(Config.model, 'utf-8'));

            data.trainOpts.iterations = Infinity;
            this.net.fromJSON(data);
        }
    }

    saveModel() {
        this.lockFile = true;
        fs.writeFile(Config.model, JSON.stringify(this.net.toJSON()), (err) => {
            this.lockFile = false;
        });
    }

    getModelData(){
        const modelData = [];

        for (let index = 0; index < this.normalData.length - this.range; index++) {
            const res = this.net.run(this.normalData.slice(index, index + this.range))[0];

            modelData[index + this.range] = res * (this.max - this.min) + this.min;
        }

        return modelData;
    }

    forecast(period: number) {
        if (this.data.length > 3) {
            const trainData = [];
            const forecastData = [];
            const temp = [...this.normalData.slice(-this.range)];

            this.normalData.forEach((v, i, arr) => {
                if (arr[this.range + i]) {
                    trainData.push({
                        input: arr.slice(i, this.range + i),
                        output: [arr[this.range + i]]
                    });
                }
            });
            this.net.train(trainData, {
                iterations: Infinity,
                errorThresh: 0.001,
                timeout: 30000
            });
            this.saveModel();

            for (let index = 0; index < period; index++) {
                const res = this.net.run(temp.slice(-this.range))[0];

                temp.push(res);
                forecastData.push(res * (this.max - this.min) + this.min);
            }

            return forecastData;
        }

        return [];
    }
}

export class MovingAverage {
    private arr: number[];
    private interval: number;

    constructor(
        inputArray: number[],
        interval = 3
    ) {
        this.arr = inputArray.slice();
        this.interval = interval;
    }

    forecast(period = 3) {
        const forecastValues: number[] = [];
        let temp = this.arr.filter(v => v);

        if (this.interval + 1 > temp.length) {
            return [];
        } else {
            temp = [...this.arr];

            for (let index = 0; index < period; index++) {
                const arrLen = temp.length;
                const mt = this.average(temp.slice(arrLen - 1 - this.interval, arrLen - 1));
                const forecastValue = +(mt + 1 / this.interval * (temp[arrLen - 1] - temp[arrLen - 2]))
                    .toFixed(3);

                forecastValues.push(forecastValue);
                temp.push(forecastValue);
            }

            return forecastValues;
        }
    }

    averageArray() {
        const arr = [];
        const temp = this.arr.filter(v => v);

        if (temp.length >= this.interval) {
            this.arr.forEach((val, i) => {
                if (i + 1 >= this.interval) {
                    arr[i] = +this
                        .average(this.arr.slice(i - this.interval + 1, i + 1))
                        .toFixed(3);
                }
            });
        }

        return arr;
    }

    average(nums: number[]) {
        return nums.reduce((acc, curr) => acc + curr, 0) / nums.length;
    }
}
