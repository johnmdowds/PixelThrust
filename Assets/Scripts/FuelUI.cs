using UnityEngine;
using UnityEngine.UI;

public class FuelUI : MonoBehaviour
{
    public PlayerController player;
    public Slider fuelSlider;

    void Update()
    {
        if (player != null && fuelSlider != null)
        {
            fuelSlider.value = player.currentFuel / player.maxFuel;
        }
    }
}
