import ILiveData from "./LiveData";

interface ILiveDataStore {
  liveData: ILiveData | null;
  setLiveData: (liveData: ILiveData) => void;
  setliveDataToNull: () => void;
}

export default ILiveDataStore;
