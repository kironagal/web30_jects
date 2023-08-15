import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Float "mo:base/Float";

actor DBank {
  stable var currentValue : Float = 400;
  //currentValue := 200;
  let id = 147228;

  stable var startTime = Time.now();
  Debug.print(debug_show (startTime));

  // Debug.print(debug_show(currentValue));
  Debug.print(debug_show (id));

  public func topUp(amount : Float) {
    currentValue += amount;
    Debug.print(debug_show (currentValue));
  };
  //topUp();

  public func withDrawl(withamount : Float) {
    let tempVal : Float = currentValue - withamount;
    if (tempVal >= 0) {
      currentValue -= withamount;
      Debug.print(debug_show (currentValue));
    } else {
      Debug.print("Balance is zero");
    };
  };

  public query func checkBalance() : async Float {
    return currentValue;
  };

  public func compound() {
    let currentTime = Time.now();
    let timeElapsedS = (currentTime - startTime) / 1000000000;
    currentValue := currentValue * (1.000000001 ** Float.fromInt(timeElapsedS));
    startTime := currentTime;
  };
};
