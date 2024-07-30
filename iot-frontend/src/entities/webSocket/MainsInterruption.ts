interface IMainsInterruptionCount {
  [daysUpto: number]: number;
  lastestValue: number | null;
}

export interface IDeviceMainsInterruption {
  [iotDeviceId: number]: IMainsInterruptionCount;
}

interface MainsInterruptionLoading {
  isLoading: boolean;
  days: 1 | 7 | 15;
}

export interface IDeviceMainsInterruptionLoading {
  [iotDeviceId: number]: MainsInterruptionLoading;
}

export interface IReceivedMessageMainsInterruption {
  count: number;
}
