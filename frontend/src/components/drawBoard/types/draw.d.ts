import { type PathTypes } from "./types";

export type DotPathObj = {
    pathType: PathTypes.dot;
    x: number;
    y: number;
    color: string;
    size: number;
};

export type SegmentPathObject = {
    pathType: PathTypes.segement;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    color: string;
    size: number;
};

export type PathObj = DotPathObj | SegmentPathObject;
