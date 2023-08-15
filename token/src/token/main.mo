import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Hash "mo:base/Hash";

actor Token {
    let owner : Principal = Principal.fromText("ibwl5-ng4cb-nls6w-cuv7o-oxhei-ik2cn-eglai-lhspa-nzsnz-d4gft-eae");
    let totalSupply : Nat = 1000000000;
    let symbol : Text = "DHOR";

    private stable var balanceEntries : [(Principal, Nat)] = [];
    private var balances = HashMap.HashMap<Principal, Nat>(1, Principal.equal, Principal.hash);

    if (balances.size() < 1) {
        balances.put(owner, totalSupply);
    };

    public query func balanceOf(who : Principal) : async Nat {

        let balance : Nat = switch (balances.get(who)) {
            case null 0;
            case (?result) result;
        };
        return balance;
        // same code as above with switch format
        // if (balances.get(who) == null) {
        //     return 0;
        // } else {
        //     return balances.get(who);
        // };
    };

    public query func getSymbol() : async Text {
        return symbol;
    };

    public shared (msg) func payOut() : async Text {
        if (balances.get(msg.caller) == null) {
            Debug.print(debug_show (msg));
            let amount = 10000;
            //balances.put(msg.caller, amount);
            let result = await transfer(msg.caller, amount);
            return result;
        } else {
            return "Already Claimed";
        };
    };

    public shared (msg) func transfer(to : Principal, amount : Nat) : async Text {
        //let result = await payOut();
        let fromBalance = await balanceOf(msg.caller);
        if (fromBalance > amount) {
            let newFromBalance : Nat = fromBalance - amount;
            balances.put(msg.caller, newFromBalance);
            let toBalance = await balanceOf(to);
            let newToBalance = toBalance + amount;
            balances.put(to, newFromBalance);

            return "Success";
        } else {
            return "Insufficient Balance";
        };
    };

    system func preupgrade() {
        balanceEntries := Iter.toArray(balances.entries());
    };

    system func postupgrade() {
        balances := HashMap.fromIter<Principal, Nat>(balanceEntries.vals(), 1, Principal.equal, Principal.hash);
        if (balances.size() < 1) {
            balances.put(owner, totalSupply);
        };
    };
};
