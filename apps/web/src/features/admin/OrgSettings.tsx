import { useState, useEffect } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { api } from '@/lib/api';

export default function OrgSettings() {
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');

  useEffect(() => {
    api.get('/api/organizations/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/organizations/settings', settings);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: string) => setSettings((s: any) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organization Settings</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardTitle>Organization</CardTitle>
            <CardContent className="mt-4 space-y-4">
              <Input label="Organization Name" value={settings.name || ''} onChange={e => setSettings((s: any) => ({ ...s, name: e.target.value }))} />
              <Input label="Timezone" value={settings.timezone || 'UTC'} onChange={e => setSettings((s: any) => ({ ...s, timezone: e.target.value }))} />
              <div className="flex items-center justify-between">
                <span>Allow Self-Registration</span>
                <button onClick={() => toggle('allowSelfRegistration')}
                  className={`relative h-6 w-11 rounded-full transition-colors ${settings.allowSelfRegistration ? 'bg-cyber-primary' : 'bg-cyber-border'}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.allowSelfRegistration ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <Button onClick={save} loading={saving}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gamification">
          <Card>
            <CardTitle>Gamification Settings</CardTitle>
            <CardContent className="mt-4 space-y-4">
              {['gamificationEnabled', 'leaderboardEnabled', 'badgesEnabled'].map(key => (
                <div key={key} className="flex items-center justify-between">
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  <button onClick={() => toggle(key)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${settings[key] ? 'bg-cyber-primary' : 'bg-cyber-border'}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings[key] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
              <Button onClick={save} loading={saving}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardContent className="mt-4 space-y-4">
              <Input label="Slack Webhook URL" placeholder="https://hooks.slack.com/services/..." />
              <Input label="Teams Webhook URL" placeholder="https://outlook.office.com/webhook/..." />
              <Button onClick={save} loading={saving}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso">
          <Card>
            <CardTitle>SSO Configuration</CardTitle>
            <CardContent className="mt-4 space-y-4">
              <Input label="SAML Entity ID" placeholder="https://your-idp.com/entity" />
              <Input label="SSO URL" placeholder="https://your-idp.com/sso" />
              <Input label="Certificate" placeholder="Paste IdP certificate..." />
              <Button onClick={save} loading={saving}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
