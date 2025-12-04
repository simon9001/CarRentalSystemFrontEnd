// src/components/Hero.tsx
import VehicleListing from '../../Componnents/Admin/Vehicles/VehicleListing.tsx';

const Hero: React.FC = () => {
  return (
    <VehicleListing
      showHero={true}
      showFeatures={true}
      showBranches={true}
      title="Find Your Perfect Rental Car"
      subtitle="Discover the perfect vehicle for your journey from our wide selection of well-maintained cars at competitive prices."
    />
  );
};

export default Hero;