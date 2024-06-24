import IDealer from "../Dealer";

interface IDealerStore {
  dealer: IDealer | null;
  setDealer: (dealer: IDealer | null) => void;
}

export default IDealerStore;
