import { Card, CardHeader, CardBody, Button } from '@/components/ui';
import { useUIStore } from '@/stores/useUIStore';
import { useFilterStore } from '@/stores/useFilterStore';

export function Settings() {
  const { darkMode, toggleDarkMode } = useUIStore();
  const resetFilters = useFilterStore(s => s.resetFilters);

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-grey-dark mt-1">Local display preferences. Nothing here is sent to a server — filters and theme persist to your browser's local storage only.</p>
      </div>

      <Card>
        <CardHeader>Appearance</CardHeader>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs text-grey-dark">Toggle the color theme.</p>
          </div>
          <Button variant="secondary" onClick={toggleDarkMode}>{darkMode ? 'Switch to light' : 'Switch to dark'}</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>Filters</CardHeader>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Reset all filters</p>
            <p className="text-xs text-grey-dark">Clears status, phase, domain, and search filters across the app.</p>
          </div>
          <Button variant="secondary" onClick={resetFilters}>Reset</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>About this data</CardHeader>
        <CardBody className="text-sm text-grey-dark space-y-2">
          <p>State, license, requirement, and product data are derived from the LCX USA U.S. Market Entry &amp; Regulatory Strategy research corpus.</p>
          <p>States marked "Unresearched" have no specialist findings recorded and are intentionally left unassessed rather than inferred.</p>
          <p>Nothing in this app constitutes legal advice. Every finding requires counsel confirmation before any product launch decision.</p>
        </CardBody>
      </Card>
    </div>
  );
}
