import json


def compare_locales(file1, file2):
    with open(file1, "r", encoding="utf-8") as f1:
        data1 = json.load(f1)
    with open(file2, "r", encoding="utf-8") as f2:
        data2 = json.load(f2)

    def get_keys(d, prefix=""):
        keys = set()
        for k, v in d.items():
            if isinstance(v, dict):
                keys.update(get_keys(v, prefix + k + "."))
            else:
                keys.add(prefix + k)
        return keys

    keys1 = get_keys(data1)
    keys2 = get_keys(data2)

    only_in_1 = keys1 - keys2
    only_in_2 = keys2 - keys1

    print(f"Keys only in {file1}:")
    for k in sorted(only_in_1):
        print(f"  - {k}")

    print(f"\nKeys only in {file2}:")
    for k in sorted(only_in_2):
        print(f"  - {k}")


if __name__ == "__main__":
    compare_locales(
        "c:/farm_management/jabersfarm/src/locales/en.json",
        "c:/farm_management/jabersfarm/src/locales/ar.json",
    )
