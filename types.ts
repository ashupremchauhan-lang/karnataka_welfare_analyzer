export interface SchemeData {
  district: string;
  scheme: string;
  year: number;
  population: number;
  eligible: number;
  actual: number;
  coverageGapScore: number;
}

export interface AssociationRule {
  districts?: string;
  if: string;
  then: string;
  support: number;
  confidence: number;
}

export interface Cluster {
  id: number;
  name: string;
  avgCoverage: number;
  suggestion: string;
  districts: string[];
}

export type View = 'dashboard' | 'map' | 'comparison' | 'rules' | 'clusters' | 'report';
